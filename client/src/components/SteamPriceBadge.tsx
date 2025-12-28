'use client';
import { useEffect, useState } from 'react';
import { gameService } from '@/services/api';
import { Badge } from "@/components/ui/badge";
import { Loader2, Tag } from "lucide-react";

export function SteamPriceBadge({ steamId }: { steamId: string }) {
    const [price, setPrice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!steamId) return;
        let isMounted = true;

        setLoading(true); 
        gameService.getSteamPrice(steamId)
            .then(data => { if (isMounted) setPrice(data); })
            .catch(() => { if (isMounted) setError(true); })
            .finally(() => { if (isMounted) setLoading(false); });

        return () => { isMounted = false; };
    }, [steamId]);

    if (!steamId || error) return null;

    if (loading) {
        return <Badge variant="outline" className="opacity-50 h-5"><Loader2 size={10} className="animate-spin mr-1"/> Steam</Badge>;
    }

    const formattedPrice = new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: price.currency || 'BRL' 
    }).format(price.final / 100);

    const hasDiscount = price.discount_percent > 0;

    return (
        <Badge variant="secondary" className={`flex gap-1 items-center h-5 ${hasDiscount ? 'bg-green-900/50 text-green-300 hover:bg-green-900/70' : 'bg-slate-800 text-slate-300'}`}>
            <Tag size={10} />
            {formattedPrice}
            {hasDiscount && (
                <span className="text-[9px] bg-green-500 text-black px-1 rounded font-bold ml-1">
                    -{price.discount_percent}%
                </span>
            )}
        </Badge>
    );
}