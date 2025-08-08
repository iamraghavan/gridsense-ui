'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export function ChannelLastUpdate({ lastUpdate }: { lastUpdate?: string }) {
    const [formattedDate, setFormattedDate] = useState<string | null>(null);

    useEffect(() => {
        if (lastUpdate) {
            try {
                // Check if lastUpdate is a valid date string before formatting
                const date = new Date(lastUpdate);
                if (!isNaN(date.getTime())) {
                    setFormattedDate(format(date, 'PPpp'));
                } else {
                    setFormattedDate('Invalid date');
                }
            } catch (error) {
                setFormattedDate('Invalid date');
            }
        } else {
            setFormattedDate(null);
        }
    }, [lastUpdate]);

    if (!lastUpdate) {
        return <>N/A</>;
    }
    
    if (!formattedDate) {
        return <Skeleton className="h-5 w-40" />;
    }

    return <>{formattedDate}</>;
}
