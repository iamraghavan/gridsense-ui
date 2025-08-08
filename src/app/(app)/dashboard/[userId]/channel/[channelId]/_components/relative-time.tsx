
'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

export function RelativeTime({ date }: { date?: string | number | Date }) {
    const [relativeTime, setRelativeTime] = useState('N/A');

    useEffect(() => {
        if (date) {
            const update = () => {
                try {
                    setRelativeTime(`${formatDistanceToNow(new Date(date))} ago`);
                } catch(e) {
                    setRelativeTime('Invalid date');
                }
            };
            
            update(); // Set initial time

            // Update every 30 seconds
            const interval = setInterval(update, 30000); 

            return () => clearInterval(interval);
        } else {
            setRelativeTime('N/A');
        }
    }, [date]);

    return <>{relativeTime}</>;
}
