import { useEffect, useRef, useState } from 'react';

interface TypewriterProps {
    text: string;
    speed?: number;
    delay?: number;
    className?: string;
}

const Typewriter = ({ text, speed = 50, delay = 0, className = '' }: TypewriterProps) => {
    const [displayText, setDisplayText] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLSpanElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimated.current) {
                        setIsVisible(true);
                        hasAnimated.current = true;
                    }
                });
            },
            { threshold: 0.1 }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        let timeoutId: number;
        let currentIndex = 0;

        const typeChar = () => {
            if (currentIndex < text.length) {
                setDisplayText(text.slice(0, currentIndex + 1));
                currentIndex++;
                timeoutId = window.setTimeout(typeChar, speed);
            }
        };

        const startTimeout = window.setTimeout(() => {
            typeChar();
        }, delay);

        return () => {
            window.clearTimeout(timeoutId);
            window.clearTimeout(startTimeout);
        };
    }, [isVisible, text, speed, delay]);

    return (
        <span ref={elementRef} className={className}>
            {displayText}
            {isVisible && displayText.length < text.length && (
                <span className="cursor">|</span>
            )}
        </span>
    );
};

export default Typewriter;
