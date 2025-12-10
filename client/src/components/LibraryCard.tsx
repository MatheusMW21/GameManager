import { BacklogGame } from "../types/game";

interface Props {
    game: BacklogGame;
}

const getStatusBadge = (status: number) => {
    switch (status) {
        case 0: return <span className="px-2 py-1 bg-gray-600 text-xs rounded text-white">Planejando</span>;
        case 1: return <span className="px-2 py-1 bg-blue-600 text-xs rounded text-white">Jogando</span>;
        case 2: return <span className="px-2 py-1 bg-green-600 text-xs rounded text-white">Zerado</span>;
        case 3: return <span className="px-2 py-1 bg-red-600 text-xs rounded text-white">Dropado</span>;
        default: return null;
    }
};

export function LibraryCard({ game }: Props) {
    return (
        <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg border border-slate-700 hover:border-purple-500 transition-all group">
            <div className="relative h-48 bg-slate-900 overflow-hidden">
                {game.coverUrl ? (
                    <img 
                        src={game.coverUrl} 
                        alt={game.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-500 text-sm">Sem Capa</div>
                )}
                
                {/* Badge de Status no topo */}
                <div className="absolute top-2 right-2">
                    {getStatusBadge(game.status)}
                </div>
            </div>
            
            <div className="p-4">
                <h3 className="font-bold text-white text-lg truncate mb-1" title={game.title}>
                    {game.title}
                </h3>
                <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>{game.platform}</span>
                    {/* Placeholder para funcionalidade de tempo futuro */}
                    <span>-- h</span>
                </div>
            </div>
        </div>
    );
}