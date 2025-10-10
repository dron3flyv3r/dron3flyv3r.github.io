import * as ort from 'onnxruntime-web';
import { encode } from 'gpt-tokenizer';

interface IntentResult {
  intent: string;
  confidence: number;
  allScores: { [key: string]: number };
}

interface ModelConfig {
  labels: string[];
  max_length: number;
  vocab_name: string;
  pad_token_id: number;
}

export class IntentClassifier {
  private session: ort.InferenceSession | null = null;
  private config: ModelConfig | null = null;
  private padTokenId: number = 199999; // EOT token
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log('Loading training summary...');
      // Load the training summary for labels and config
      const configResponse = await fetch('/training_summary.json');
      if (!configResponse.ok) {
        throw new Error(`Failed to fetch training_summary.json: ${configResponse.status} ${configResponse.statusText}`);
      }
      const trainingData = await configResponse.json();
      console.log('Training summary loaded:', trainingData);
      
      this.config = {
        labels: trainingData.labels,
        max_length: trainingData.dataset_config.max_length,
        vocab_name: 'p50k_base',
        pad_token_id: this.padTokenId,
      };

      console.log('Loading ONNX model...');
      // Load ONNX model
      // Set the path to WASM files for onnxruntime-web
      ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.3/dist/';
      
      this.session = await ort.InferenceSession.create('/model.onnx', {
        executionProviders: ['wasm'],
      });

      this.initialized = true;
      console.log('Intent classifier initialized successfully');
    } catch (error) {
      console.error('Failed to initialize intent classifier:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  }

  private filterText(text: string): string {
    // Remove punctuation and normalize whitespace
    text = text.replace(/[^a-zA-Z0-9\s]/g, '');
    text = text.replace(/\s+/g, ' ');
    text = text.trim();
    text = text.toLowerCase();
    return text;
  }

  private lemmatizeText(text: string): string {
    // Lemmatization dictionary based on common patterns and smart home vocabulary
    // This matches the simplemma behavior used during training
    const commonLemmas: { [key: string]: string } = {
      // Irregular verbs
      'are': 'be',
      'is': 'be',
      'was': 'be',
      'were': 'be',
      'been': 'be',
      'being': 'be',
      
      // Verbs - present continuous/gerund (-ing)
      'playing': 'playe',
      'turning': 'turn',
      'setting': 'set',
      'checking': 'check',
      'starting': 'start',
      'locking': 'lock',
      'adjusting': 'adjust',
      'activating': 'activate',
      'having': 'have',
      'making': 'make',
      'taking': 'take',
      'giving': 'give',
      
      // Verbs - third person singular (-s)
      'plays': 'playe',
      'turns': 'turn',
      'sets': 'set',
      'checks': 'check',
      'starts': 'start',
      'adjusts': 'adjust',
      'activates': 'activate',
      'has': 'have',
      'does': 'do',
      'goes': 'go',
      
      // Verbs - past tense (-ed)
      'played': 'playe',
      'turned': 'turn',
      'checked': 'check',
      'started': 'start',
      'locked': 'lock',
      'adjusted': 'adjust',
      'activated': 'activate',
      
      // Nouns - plurals
      'lights': 'light',
      'doors': 'door',
      'reminders': 'reminder',
      'timers': 'timer',
      'scenes': 'scene',
      'minutes': 'minute',
      'hours': 'hour',
      'seconds': 'second',
      'degrees': 'degree',
      'devices': 'device',
      
      // Nouns with locks -> lock (verb/noun form)
      'locks': 'lock',
      
      // Common smart home terms
      'thermostat': 'thermostat',
      'security': 'security',
      'vacuum': 'vacuum',
      'energy': 'energy',
      'usage': 'usage',
      'weather': 'weather',
      'temperature': 'temperature',
      'music': 'music',
      'greeting': 'greeting',
    };

    const words = text.split(' ').filter(w => w.length > 0);
    return words.map(word => {
      // First check exact match
      if (commonLemmas[word]) {
        return commonLemmas[word];
      }
      
      // Apply basic English lemmatization rules
      // Remove -ing
      if (word.endsWith('ing') && word.length > 4) {
        const base = word.slice(0, -3);
        // Handle doubled consonants (e.g., 'running' -> 'run')
        if (base.length >= 2 && base[base.length - 1] === base[base.length - 2]) {
          return base.slice(0, -1);
        }
        return base + 'e'; // Default: add 'e' (e.g., 'having' -> 'have')
      }
      
      // Remove -ed
      if (word.endsWith('ed') && word.length > 3) {
        const base = word.slice(0, -2);
        if (base.endsWith('i')) {
          return base.slice(0, -1) + 'y'; // e.g., 'tried' -> 'try'
        }
        return base;
      }
      
      // Remove -s (plural/third person)
      if (word.endsWith('s') && word.length > 2 && !word.endsWith('ss')) {
        if (word.endsWith('ies')) {
          return word.slice(0, -3) + 'y'; // e.g., 'tries' -> 'try'
        }
        if (word.endsWith('es') && word.length > 3) {
          return word.slice(0, -2);
        }
        return word.slice(0, -1);
      }
      
      return word;
    }).join(' ');
  }

  private tokenize(text: string): { inputIds: number[]; attentionMask: number[] } {
    if (!this.config) {
      throw new Error('Classifier not initialized');
    }

    // Filter and normalize text
    let processedText = this.filterText(text);
    processedText = this.lemmatizeText(processedText);

    console.log('Processed Text:', processedText);
    
    // Encode using gpt-tokenizer (uses p50k_base vocabulary)
    let tokenIds = encode(processedText);
    
    // Truncate to max_length
    tokenIds = tokenIds.slice(0, this.config.max_length);

    // Create attention mask (1 for real tokens, 0 for padding)
    const attentionMask = Array(tokenIds.length).fill(1);

    // Pad to max_length
    const paddingNeeded = this.config.max_length - tokenIds.length;
    if (paddingNeeded > 0) {
      tokenIds = [...tokenIds, ...Array(paddingNeeded).fill(this.padTokenId)];
      attentionMask.push(...Array(paddingNeeded).fill(0));
    }
    console.log("TokenIds", tokenIds);
    
    return { inputIds: tokenIds, attentionMask };
  }

  async classify(text: string): Promise<IntentResult> {
    if (!this.initialized || !this.session || !this.config) {
      throw new Error('Classifier not initialized. Call initialize() first.');
    }

    // Tokenize input
    const { inputIds, attentionMask } = this.tokenize(text);

    // Create tensors
    const inputIdsTensor = new ort.Tensor('int64', BigInt64Array.from(inputIds.map(id => BigInt(id))), [1, this.config.max_length]);
    const attentionMaskTensor = new ort.Tensor('int64', BigInt64Array.from(attentionMask.map(mask => BigInt(mask))), [1, this.config.max_length]);

    // Run inference
    const feeds = {
      input_ids: inputIdsTensor,
      attention_mask: attentionMaskTensor,
    };

    const results = await this.session.run(feeds);
    const logits = results.logits.data as Float32Array;

    // Apply softmax to get probabilities
    const expLogits = Array.from(logits).map(x => Math.exp(x));
    const sumExp = expLogits.reduce((a, b) => a + b, 0);
    const probabilities = expLogits.map(x => x / sumExp);

    // Get the predicted intent
    const maxIdx = probabilities.indexOf(Math.max(...probabilities));
    const intent = this.config.labels[maxIdx];
    const confidence = probabilities[maxIdx];

    // Create scores object
    const allScores: { [key: string]: number } = {};
    this.config.labels.forEach((label, idx) => {
      allScores[label] = probabilities[idx];
    });

    return {
      intent,
      confidence,
      allScores,
    };
  }

  dispose(): void {
    this.initialized = false;
  }
}

// Export a singleton instance
export const intentClassifier = new IntentClassifier();
