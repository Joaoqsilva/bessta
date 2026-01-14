import { useState } from 'react';
import {
    Instagram, Facebook, Twitter, Linkedin, Youtube,
    MessageCircle, Phone, Mail, Globe, X
} from 'lucide-react';

// Definição das redes sociais suportadas com seus prefixos de URL
const SOCIAL_NETWORKS = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, prefix: 'https://instagram.com/', placeholder: '@usuario' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, prefix: 'https://facebook.com/', placeholder: 'pagina' },
    { id: 'twitter', name: 'Twitter/X', icon: Twitter, prefix: 'https://twitter.com/', placeholder: '@usuario' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, prefix: 'https://linkedin.com/in/', placeholder: 'perfil' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, prefix: 'https://youtube.com/@', placeholder: '@canal' },
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, prefix: 'https://wa.me/', placeholder: '5511999999999' },
    { id: 'phone', name: 'Telefone', icon: Phone, prefix: 'tel:', placeholder: '+5511999999999' },
    { id: 'email', name: 'Email', icon: Mail, prefix: 'mailto:', placeholder: 'email@dominio.com' },
    { id: 'website', name: 'Website', icon: Globe, prefix: 'https://', placeholder: 'www.site.com' },
];

interface SocialLink {
    network: string;
    handle: string;
}

interface EditableSocialLinkProps {
    id: string;
    links: SocialLink[];
    isEditorMode?: boolean;
    onUpdateLinks?: (links: SocialLink[]) => void;
    className?: string;
    iconSize?: number;
    iconClassName?: string;
}

export const EditableSocialLink = ({
    id,
    links = [],
    isEditorMode = false,
    onUpdateLinks,
    className = '',
    iconSize = 20,
    iconClassName = ''
}: EditableSocialLinkProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLinks, setEditingLinks] = useState<SocialLink[]>(links);

    const getNetworkInfo = (networkId: string) => {
        return SOCIAL_NETWORKS.find(n => n.id === networkId) || SOCIAL_NETWORKS[0];
    };

    const handleSave = () => {
        onUpdateLinks?.(editingLinks.filter(l => l.handle.trim()));
        setIsModalOpen(false);
    };

    const handleAddLink = () => {
        setEditingLinks([...editingLinks, { network: 'instagram', handle: '' }]);
    };

    const handleRemoveLink = (index: number) => {
        setEditingLinks(editingLinks.filter((_, i) => i !== index));
    };

    const handleUpdateLink = (index: number, field: keyof SocialLink, value: string) => {
        const updated = [...editingLinks];
        updated[index] = { ...updated[index], [field]: value };
        setEditingLinks(updated);
    };

    const buildUrl = (network: string, handle: string) => {
        const info = getNetworkInfo(network);
        return info.prefix + handle.replace('@', '');
    };

    return (
        <>
            {/* Render Social Icons */}
            <div className={`flex gap-4 ${className}`}>
                {links.filter(l => l.handle).map((link, idx) => {
                    const info = getNetworkInfo(link.network);
                    const IconComponent = info.icon;
                    return (
                        <a
                            key={idx}
                            href={buildUrl(link.network, link.handle)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`transition-colors ${iconClassName}`}
                            onClick={(e) => {
                                if (isEditorMode) {
                                    e.preventDefault();
                                    setIsModalOpen(true);
                                }
                            }}
                        >
                            <IconComponent size={iconSize} />
                        </a>
                    );
                })}

                {/* Add button in editor mode if no links */}
                {isEditorMode && links.length === 0 && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="p-2 border-2 border-dashed border-gray-300 rounded-full text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                        title="Adicionar Redes Sociais"
                    >
                        <MessageCircle size={iconSize} />
                    </button>
                )}

                {/* Edit button overlay in editor mode */}
                {isEditorMode && links.length > 0 && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="p-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Editar
                    </button>
                )}
            </div>

            {/* Modal for editing social links */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={() => setIsModalOpen(false)}>
                    <div
                        className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Redes Sociais</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                            {editingLinks.map((link, idx) => {
                                const info = getNetworkInfo(link.network);
                                return (
                                    <div key={idx} className="bg-gray-50 rounded-xl p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <select
                                                value={link.network}
                                                onChange={(e) => handleUpdateLink(idx, 'network', e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            >
                                                {SOCIAL_NETWORKS.map(net => (
                                                    <option key={net.id} value={net.id}>{net.name}</option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => handleRemoveLink(idx)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]">
                                                {info.prefix}
                                            </span>
                                            <input
                                                type="text"
                                                value={link.handle}
                                                onChange={(e) => handleUpdateLink(idx, 'handle', e.target.value)}
                                                placeholder={info.placeholder}
                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={handleAddLink}
                            className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors font-medium"
                        >
                            + Adicionar Rede Social
                        </button>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export { SOCIAL_NETWORKS };
export type { SocialLink };
