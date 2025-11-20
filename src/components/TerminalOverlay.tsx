import React, { useState, useEffect, useRef } from 'react';
import './TerminalOverlay.css';

interface TerminalOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

interface CommandHistory {
    command: string;
    output: React.ReactNode;
}

const TerminalOverlay: React.FC<TerminalOverlayProps> = ({ isOpen, onClose }) => {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<CommandHistory[]>([
        { command: '', output: 'Welcome to the interactive terminal. Type "help" for available commands.' }
    ]);
    const [username, setUsername] = useState('guest');
    const inputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const commands = ['help', 'ls', 'cd', 'cat', 'whoami', 'su', 'clear', 'exit'];
    const fileSystem = {
        dirs: ['about', 'skills', 'projects', 'sopa'],
        files: ['contact.txt', 'resume.pdf', 'aboutme.txt', 'skills.json']
    };

    useEffect(() => {
        if (isOpen && inputRef.current) {
            // Small timeout to ensure focus after animation/render
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [history]);

    const handleCommand = (cmd: string) => {
        const trimmedCmd = cmd.trim();
        if (!trimmedCmd) return;

        const parts = trimmedCmd.split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        let output: React.ReactNode = '';

        switch (command) {
            case 'help':
                output = (
                    <div className="terminal-help">
                        <p>Available commands:</p>
                        <ul>
                            <li><span className="cmd">help</span> - Show this help message</li>
                            <li><span className="cmd">ls</span> - List available sections</li>
                            <li><span className="cmd">cd [section]</span> - Navigate to a section</li>
                            <li><span className="cmd">cat [file]</span> - Read a file</li>
                            <li><span className="cmd">su [name]</span> - Change username</li>
                            <li><span className="cmd">whoami</span> - Show current user</li>
                            <li><span className="cmd">clear</span> - Clear terminal history</li>
                            <li><span className="cmd">exit</span> - Close terminal</li>
                        </ul>
                    </div>
                );
                break;
            case 'ls':
                output = (
                    <div className="terminal-ls">
                        {fileSystem.dirs.map(d => <span key={d} className="dir">{d}/</span>)}
                        {fileSystem.files.map(f => <span key={f} className="file">{f}</span>)}
                    </div>
                );
                break;
            case 'cd':
                if (args.length === 0) {
                    output = 'usage: cd [directory]';
                } else {
                    const target = args[0].replace(/\/$/, ''); // Remove trailing slash
                    const sectionMap: Record<string, string> = {
                        'about': '.about-section',
                        'skills': '.skills-section',
                        'projects': '.projects-section',
                        'sopa': '.sopa-section'
                    };

                    const selector = sectionMap[target];
                    if (selector) {
                        const element = document.querySelector(selector);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                            output = `Navigating to ${target}...`;
                            onClose();
                        } else {
                            output = `Directory not found: ${target}`;
                        }
                    } else {
                        output = `Directory not found: ${target}`;
                    }
                }
                break;
            case 'cat':
                if (args.length === 0) {
                    output = 'usage: cat [file]';
                } else {
                    const file = args[0];
                    if (file === 'contact.txt') {
                        output = 'contact@kasperlarsen.tech';
                    } else if (file === 'resume.pdf') {
                        output = 'Error: Binary file not printable to stdout. (Resume download not implemented yet)';
                    } else if (file === 'aboutme.txt') {
                        output = "I'm an engineering student driven by the idea of creating systems that think, learn, and adapt.";
                    } else if (file === 'skills.json') {
                        output = '{ "languages": ["Python", "C++", "SQL", "TS"], "ai": ["PyTorch", "RL", "NLP"] }';
                    } else {
                        output = `File not found: ${file}`;
                    }
                }
                break;
            case 'su':
                if (args.length === 0) {
                    output = 'usage: su [username]';
                } else {
                    setUsername(args[0]);
                    output = `Switched user to ${args[0]}`;
                }
                break;
            case 'whoami':
                output = username;
                break;
            case 'clear':
                setHistory([]);
                return;
            case 'exit':
                onClose();
                return;
            default:
                output = `Command not found: ${command}`;
        }

        setHistory(prev => [...prev, { command: cmd, output }]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleCommand(input);
            setInput('');
        } else if (e.key === 'Tab') {
            e.preventDefault();
            handleAutocomplete();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const handleAutocomplete = () => {
        const parts = input.split(' ');

        if (parts.length === 1) {
            // Complete command
            const current = parts[0];
            const matches = commands.filter(c => c.startsWith(current));
            if (matches.length === 1) {
                setInput(matches[0] + ' ');
            }
        } else if (parts.length === 2) {
            // Complete argument
            const cmd = parts[0];
            const current = parts[1];

            if (cmd === 'cd') {
                const matches = fileSystem.dirs.filter(d => d.startsWith(current));
                if (matches.length === 1) {
                    setInput(`${cmd} ${matches[0]}`);
                }
            } else if (cmd === 'cat') {
                const matches = fileSystem.files.filter(f => f.startsWith(current));
                if (matches.length === 1) {
                    setInput(`${cmd} ${matches[0]}`);
                }
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="terminal-overlay">
            <button className="terminal-close-btn" onClick={onClose} aria-label="Close Terminal">×</button>
            <div className="terminal-content">
                {history.map((entry, i) => (
                    <div key={i} className="terminal-entry">
                        {entry.command && (
                            <div className="terminal-command-line">
                                <span className="prompt-user">{username}@backend</span>
                                <span className="prompt-sep">:</span>
                                <span className="prompt-path">~</span>
                                <span className="prompt-char">$</span>
                                <span className="command-text">{entry.command}</span>
                            </div>
                        )}
                        <div className="terminal-output">{entry.output}</div>
                    </div>
                ))}
                <div className="terminal-input-line">
                    <span className="prompt-user">{username}@backend</span>
                    <span className="prompt-sep">:</span>
                    <span className="prompt-path">~</span>
                    <span className="prompt-char">$</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="terminal-input"
                        autoComplete="off"
                        spellCheck="false"
                    />
                </div>
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default TerminalOverlay;
