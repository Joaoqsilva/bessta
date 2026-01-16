import { useState } from 'react';
import {
    Instagram, Facebook, Twitter, Linkedin, Youtube,
    MessageCircle, Phone, Mail, Globe, X, Plus, Trash2
} from 'lucide-react';

// Definição das redes sociais suportadas com seus prefixos de URL
const SOCIAL_NETWORKS = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, prefix: 'https://instagram.com/', placeholder: '@usuario', color: '#E4405F' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, prefix: 'https://facebook.com/', placeholder: 'pagina', color: '#1877F2' },
    { id: 'twitter', name: 'Twitter/X', icon: Twitter, prefix: 'https://twitter.com/', placeholder: '@usuario', color: '#1DA1F2' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, prefix: 'https://linkedin.com/in/', placeholder: 'perfil', color: '#0A66C2' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, prefix: 'https://youtube.com/@', placeholder: '@canal', color: '#FF0000' },
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, prefix: 'https://wa.me/', placeholder: '5547991394589', color: '#25D366' },
    { id: 'phone', name: 'Telefone', icon: Phone, prefix: 'tel:', placeholder: '+5547991394589', color: '#4CAF50' },
    { id: 'email', name: 'Email', icon: Mail, prefix: 'mailto:', placeholder: 'email@dominio.com', color: '#EA4335' },
    { id: 'website', name: 'Website', icon: Globe, prefix: 'https://', placeholder: 'www.site.com', color: '#6B7280' },
];

const MAX_SOCIAL_LINKS = 4;

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
    const [activeTab, setActiveTab] = useState(0);

    const getNetworkInfo = (networkId: string) => {
        return SOCIAL_NETWORKS.find(n => n.id === networkId) || SOCIAL_NETWORKS[0];
    };

    const handleSave = () => {
        onUpdateLinks?.(editingLinks.filter(l => l.handle.trim()));
        setIsModalOpen(false);
    };

    const handleAddLink = () => {
        if (editingLinks.length >= MAX_SOCIAL_LINKS) return;

        // Find a network that's not already used
        const usedNetworks = editingLinks.map(l => l.network);
        const availableNetwork = SOCIAL_NETWORKS.find(n => !usedNetworks.includes(n.id));

        const newLinks = [...editingLinks, { network: availableNetwork?.id || 'instagram', handle: '' }];
        setEditingLinks(newLinks);
        setActiveTab(newLinks.length - 1);
    };

    const handleRemoveLink = (index: number) => {
        const newLinks = editingLinks.filter((_, i) => i !== index);
        setEditingLinks(newLinks);
        if (activeTab >= newLinks.length && newLinks.length > 0) {
            setActiveTab(newLinks.length - 1);
        } else if (newLinks.length === 0) {
            setActiveTab(0);
        }
    };

    const handleUpdateLink = (index: number, field: keyof SocialLink, value: string) => {
        const updated = [...editingLinks];
        updated[index] = { ...updated[index], [field]: value };
        setEditingLinks(updated);
    };

    // Sanitize handle to prevent XSS and injection attacks
    const sanitizeHandle = (handle: string): string => {
        return handle
            .replace(/<[^>]*>/g, '')
            .replace(/[<>'"(){}[\]\\;]/g, '')
            .trim();
    };

    const buildUrl = (network: string, handle: string) => {
        const info = getNetworkInfo(network);
        const safeHandle = sanitizeHandle(handle.replace('@', ''));
        return info.prefix + safeHandle;
    };

    const openModal = () => {
        setEditingLinks(links.length > 0 ? [...links] : [{ network: 'instagram', handle: '' }]);
        setActiveTab(0);
        setIsModalOpen(true);
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
                                    openModal();
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
                        onClick={openModal}
                        className="p-2 border-2 border-dashed border-gray-300 rounded-full text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                        title="Adicionar Redes Sociais"
                    >
                        <MessageCircle size={iconSize} />
                    </button>
                )}

                {/* Edit button overlay in editor mode */}
                {isEditorMode && links.length > 0 && (
                    <button
                        onClick={openModal}
                        className="p-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Editar
                    </button>
                )}
            </div>

            {/* Modal for editing social links */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxHeight: '90vh' }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-5 text-white">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold">Redes Sociais</h3>
                                    <p className="text-white/80 text-sm mt-1">
                                        Configure até {MAX_SOCIAL_LINKS} links ({editingLinks.length}/{MAX_SOCIAL_LINKS})
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex items-center border-b border-gray-200 bg-gray-50 px-4">
                            <div className="flex-1 flex overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                                {editingLinks.map((link, idx) => {
                                    const info = getNetworkInfo(link.network);
                                    const IconComponent = info.icon;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveTab(idx)}
                                            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${activeTab === idx
                                                ? 'border-blue-500 text-blue-600 bg-white'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            <IconComponent size={16} style={{ color: info.color }} />
                                            <span className="text-sm font-medium">{info.name}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Add Button */}
                            {editingLinks.length < MAX_SOCIAL_LINKS && (
                                <button
                                    onClick={handleAddLink}
                                    className="flex items-center gap-1 px-3 py-2 ml-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Adicionar rede social"
                                >
                                    <Plus size={18} />
                                </button>
                            )}
                        </div>

                        {/* Tab Content */}
                        <div className="p-6">
                            {editingLinks.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MessageCircle size={32} className="text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 mb-4">Nenhuma rede social configurada</p>
                                    <button
                                        onClick={handleAddLink}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                    >
                                        + Adicionar Primeira Rede
                                    </button>
                                </div>
                            ) : (
                                editingLinks.map((link, idx) => {
                                    if (idx !== activeTab) return null;

                                    const info = getNetworkInfo(link.network);
                                    const IconComponent = info.icon;

                                    return (
                                        <div key={idx} className="space-y-5">
                                            {/* Network Selector */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Tipo de Rede
                                                </label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {SOCIAL_NETWORKS.slice(0, 6).map(net => {
                                                        const NetIcon = net.icon;
                                                        const isSelected = link.network === net.id;
                                                        return (
                                                            <button
                                                                key={net.id}
                                                                onClick={() => handleUpdateLink(idx, 'network', net.id)}
                                                                className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${isSelected
                                                                    ? 'border-blue-500 bg-blue-50'
                                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                                    }`}
                                                            >
                                                                <NetIcon size={18} style={{ color: net.color }} />
                                                                <span className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                                                                    {net.name}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                {/* More options dropdown */}
                                                <select
                                                    value={link.network}
                                                    onChange={(e) => handleUpdateLink(idx, 'network', e.target.value)}
                                                    className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                >
                                                    {SOCIAL_NETWORKS.map(net => (
                                                        <option key={net.id} value={net.id}>{net.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Handle Input */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Seu {info.name}
                                                </label>
                                                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                                                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 border-r border-gray-300">
                                                        <IconComponent size={18} style={{ color: info.color }} />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={link.handle}
                                                        onChange={(e) => handleUpdateLink(idx, 'handle', e.target.value)}
                                                        placeholder={info.placeholder}
                                                        className="flex-1 px-4 py-3 text-gray-800 placeholder-gray-400 bg-white outline-none"
                                                    />
                                                </div>
                                                <p className="mt-2 text-xs text-gray-500">
                                                    Link: {info.prefix}<span className="text-blue-600">{link.handle || info.placeholder}</span>
                                                </p>
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                onClick={() => handleRemoveLink(idx)}
                                                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                                            >
                                                <Trash2 size={16} />
                                                Remover esta rede
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="flex gap-3 p-5 bg-gray-50 border-t border-gray-200">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium shadow-sm"
                            >
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export { SOCIAL_NETWORKS, MAX_SOCIAL_LINKS };
export type { SocialLink };
