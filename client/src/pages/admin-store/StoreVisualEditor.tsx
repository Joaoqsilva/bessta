import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Layout, Palette, Type, Image as ImageIcon, MessageCircle,
    Save, ArrowLeft, Monitor, Smartphone
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { POPULAR_ICONS, DynamicIcon } from '../../components/EditableIcon';
import { StoreBookingPage } from '../public/StoreBookingPage';
import { useAuth } from '../../context/AuthContext';
import {
    getStoreCustomization,
    saveStoreCustomization,
    type StoreCustomization,
    PRESET_COLORS,
    FONT_OPTIONS,
    LAYOUT_OPTIONS,
    BUTTON_STYLES,
    imageToBase64
} from '../../context/StoreCustomizationService';
import './StoreVisualEditor.css';

type EditorTab = 'layout' | 'colors' | 'typography' | 'images' | 'content' | 'social' | 'text-editor' | 'icon-editor';

export const StoreVisualEditor = () => {
    const navigate = useNavigate();
    const { store } = useAuth();
    const [activeTab, setActiveTab] = useState<EditorTab | null>(null);
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [customization, setCustomization] = useState<StoreCustomization | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [editingTextId, setEditingTextId] = useState<string | null>(null);
    const [editingTextDefault, setEditingTextDefault] = useState<string>('');
    const [editingTextColor, setEditingTextColor] = useState<string>('');

    // Icon editing states
    const [editingIconId, setEditingIconId] = useState<string | null>(null);
    const [editingIconDefault, setEditingIconDefault] = useState<string>('');

    // Initialize customization state
    useEffect(() => {
        if (store?.id) {
            getStoreCustomization(store.id).then(setCustomization);
        }
    }, [store?.id]);

    // Update customization helper - now supports batch updates
    const updateCustomization = (keyOrObject: keyof StoreCustomization | Partial<StoreCustomization>, value?: any) => {
        if (!customization) return;

        setCustomization(prev => {
            if (!prev) return null;
            if (typeof keyOrObject === 'string') {
                return { ...prev, [keyOrObject]: value };
            } else {
                return { ...prev, ...keyOrObject };
            }
        });
        setHasChanges(true);
    };

    // Save changes
    const handleSave = async () => {
        if (!customization || !store?.id) return;

        setIsSaving(true);
        try {
            const success = await saveStoreCustomization(customization);
            if (success) {
                setHasChanges(false);
            } else {
                alert('Erro ao salvar alterações. Tente novamente.');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Erro ao salvar alterações.');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle Image Upload
    const handleImageUpload = async (key: 'logo' | 'coverImage' | 'aboutImage', file: File) => {
        try {
            const base64 = await imageToBase64(file);
            updateCustomization(key, base64);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Erro ao carregar imagem. Tente novamente.');
        }
    };

    // Handle direct edit actions from the preview
    const handleEditAction = (action: string, defaultValue: string = '', defaultColor: string = '') => {
        if (action.startsWith('text-edit__')) {
            const id = action.split('text-edit__')[1];
            setEditingTextId(id);
            setEditingTextDefault(defaultValue);
            setEditingTextColor(defaultColor);
            setActiveTab('text-editor');
            return;
        }
        // Handle icon edit - open in sidebar
        if (action.startsWith('icon-edit__')) {
            const id = action.split('icon-edit__')[1];
            setEditingIconId(id);
            setEditingIconDefault(defaultValue);
            setActiveTab('icon-editor');
            return;
        }
        // Handle team photo uploads
        if (action.startsWith('team-photo-')) {
            setActiveTab('images');
            // Scroll to team images section after a brief delay
            setTimeout(() => {
                document.getElementById('team-images-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            return;
        }
        switch (action) {
            case 'banner':
            case 'bio':
            case 'specialties':
            case 'gallery':
                setActiveTab('content');
                break;
            case 'header':
                setActiveTab('colors');
                break;
            case 'logo':
                setActiveTab('images');
                break;
            case 'info':
                setActiveTab('content');
                break;
            case 'social':
                setActiveTab('social');
                break;
            case 'about-image':
            case 'cover-image':
                setActiveTab('images');
                break;
            case 'about-section':
                setActiveTab('content');
                break;
            default:
                break;
        }
    };

    if (!customization || !store) {
        return <div className="flex items-center justify-center h-screen">Carregando editor...</div>;
    }

    return (
        <div className="visual-editor-container">
            {/* Top Bar */}
            <header className="editor-top-bar">
                <div className="top-bar-left">
                    <button onClick={() => navigate('/app/settings')} className="back-button">
                        <ArrowLeft size={18} />
                        <span>Voltar</span>
                    </button>
                    <div className="divider" />
                    <span className="editor-title">Editor Visual</span>
                </div>

                <div className="view-toggles">
                    <button
                        className={`view-toggle ${viewMode === 'desktop' ? 'active' : ''}`}
                        onClick={() => setViewMode('desktop')}
                        title="Visualização Desktop"
                    >
                        <Monitor size={18} />
                    </button>
                    <button
                        className={`view-toggle ${viewMode === 'mobile' ? 'active' : ''}`}
                        onClick={() => setViewMode('mobile')}
                        title="Visualização Mobile"
                    >
                        <Smartphone size={18} />
                    </button>
                </div>

                <div className="top-bar-actions">
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSave}
                        isLoading={isSaving}
                    >
                        <Save size={16} className="mr-2" />
                        {hasChanges ? 'Salvar Alterações' : 'Salvar'}
                    </Button>
                </div>
            </header>

            <div className="editor-main">
                {/* Sidebar Tools */}
                <aside className="editor-sidebar">
                    <nav className="sidebar-nav">
                        <button
                            className={`tool-btn ${activeTab === 'layout' ? 'active' : ''}`}
                            onClick={() => setActiveTab(activeTab === 'layout' ? null : 'layout')}
                        >
                            <Layout size={20} />
                            <span>Layout</span>
                        </button>
                        <button
                            className={`tool-btn ${activeTab === 'colors' ? 'active' : ''}`}
                            onClick={() => setActiveTab(activeTab === 'colors' ? null : 'colors')}
                        >
                            <Palette size={20} />
                            <span>Cores</span>
                        </button>
                        <button
                            className={`tool-btn ${activeTab === 'typography' ? 'active' : ''}`}
                            onClick={() => setActiveTab(activeTab === 'typography' ? null : 'typography')}
                        >
                            <Type size={20} />
                            <span>Fontes</span>
                        </button>
                        <button
                            className={`tool-btn ${activeTab === 'images' ? 'active' : ''}`}
                            onClick={() => setActiveTab(activeTab === 'images' ? null : 'images')}
                        >
                            <ImageIcon size={20} />
                            <span>Imagens</span>
                        </button>
                        <button
                            className={`tool-btn ${activeTab === 'social' ? 'active' : ''}`}
                            onClick={() => setActiveTab(activeTab === 'social' ? null : 'social')}
                        >
                            <MessageCircle size={20} />
                            <span>Redes</span>
                        </button>
                    </nav>

                    {/* Active Tool Panel */}
                    {activeTab && (
                        <div className="tool-panel">
                            <div className="panel-header">
                                <h3>
                                    {activeTab === 'layout' && 'Layout e Estilo'}
                                    {activeTab === 'colors' && 'Cores da Marca'}
                                    {activeTab === 'typography' && 'Tipografia'}
                                    {activeTab === 'images' && 'Imagens'}
                                    {activeTab === 'content' && 'Conteúdo'}
                                    {activeTab === 'social' && 'Redes Sociais'}
                                    {activeTab === 'text-editor' && 'Editar Texto'}
                                </h3>
                                <button className="close-panel" onClick={() => setActiveTab(null)}>×</button>
                            </div>

                            <div className="panel-content">
                                {/* TEXT EDITOR TAB */}
                                {activeTab === 'text-editor' && editingTextId && (
                                    <div className="config-group">
                                        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded">
                                            <h4 className="font-semibold text-blue-800 mb-1">Editando Texto</h4>
                                            <code className="text-xs text-blue-600 break-all">{editingTextId}</code>
                                        </div>

                                        {/* Text Content */}
                                        <div className="form-group">
                                            <label className="form-label">Novo Texto</label>
                                            <textarea
                                                className="form-input min-h-[120px]"
                                                placeholder={editingTextDefault || "Digite o novo texto aqui..."}
                                                value={customization.textOverrides?.[editingTextId]?.content ?? ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const currentOverrides = customization.textOverrides || {};
                                                    const currentItem = currentOverrides[editingTextId] || {};
                                                    const newOverrides = { ...currentOverrides };

                                                    if (val === '' && !currentItem.color) {
                                                        delete newOverrides[editingTextId];
                                                    } else {
                                                        newOverrides[editingTextId] = { ...currentItem, content: val || undefined };
                                                        if (!val) delete newOverrides[editingTextId].content;
                                                    }
                                                    updateCustomization('textOverrides', newOverrides);
                                                }}
                                            />
                                            {!customization.textOverrides?.[editingTextId]?.content && editingTextDefault && (
                                                <p className="text-xs text-gray-500 mt-2">Original: {editingTextDefault}</p>
                                            )}
                                        </div>

                                        {/* Text Color */}
                                        <div className="form-group mt-4">
                                            <label className="form-label">Cor do Texto</label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="color"
                                                    className="w-12 h-10 rounded cursor-pointer border border-gray-200"
                                                    value={customization.textOverrides?.[editingTextId]?.color || editingTextColor || '#000000'}
                                                    onChange={(e) => {
                                                        const color = e.target.value;
                                                        const currentOverrides = customization.textOverrides || {};
                                                        const currentItem = currentOverrides[editingTextId] || {};
                                                        const newOverrides = {
                                                            ...currentOverrides,
                                                            [editingTextId]: { ...currentItem, color }
                                                        };
                                                        updateCustomization('textOverrides', newOverrides);
                                                    }}
                                                />
                                                <input
                                                    type="text"
                                                    className="form-input flex-1"
                                                    placeholder="#000000"
                                                    value={customization.textOverrides?.[editingTextId]?.color || ''}
                                                    onChange={(e) => {
                                                        const color = e.target.value;
                                                        const currentOverrides = customization.textOverrides || {};
                                                        const currentItem = currentOverrides[editingTextId] || {};
                                                        const newOverrides = { ...currentOverrides };

                                                        if (!color && !currentItem.content) {
                                                            delete newOverrides[editingTextId];
                                                        } else {
                                                            newOverrides[editingTextId] = { ...currentItem, color: color || undefined };
                                                            if (!color) delete newOverrides[editingTextId].color;
                                                        }
                                                        updateCustomization('textOverrides', newOverrides);
                                                    }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Deixe vazio para usar a cor padrão</p>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4">
                                            <button
                                                className="text-sm text-red-600 hover:text-red-700 underline"
                                                onClick={() => {
                                                    const currentOverrides = customization.textOverrides || {};
                                                    const newOverrides = { ...currentOverrides };
                                                    delete newOverrides[editingTextId];
                                                    updateCustomization('textOverrides', newOverrides);
                                                }}
                                            >
                                                Restaurar Original
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* LAYOUT TAB */}
                                {activeTab === 'layout' && (
                                    <div className="config-group">
                                        <label>Estilo do Layout</label>
                                        <div className="grid-options">
                                            {LAYOUT_OPTIONS.map(layout => (
                                                <div
                                                    key={layout.id}
                                                    className={`card-option ${customization.layout === layout.id ? 'selected' : ''}`}
                                                    onClick={() => updateCustomization('layout', layout.id)}
                                                >
                                                    <span className="option-name">{layout.name}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <label className="mt-4">Estilo dos Botões</label>
                                        <div className="grid-options">
                                            {BUTTON_STYLES.map(style => (
                                                <div
                                                    key={style.id}
                                                    className={`card-option ${customization.buttonStyle === style.id ? 'selected' : ''}`}
                                                    onClick={() => updateCustomization('buttonStyle', style.id)}
                                                >
                                                    <span className="option-name">{style.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* COLORS TAB */}
                                {activeTab === 'colors' && (
                                    <div className="config-group">
                                        <label>Paletas Predefinidas</label>
                                        <div className="color-presets-grid">
                                            {PRESET_COLORS.map((preset, index) => (
                                                <button
                                                    key={index}
                                                    className="preset-btn"
                                                    title={preset.name}
                                                    onClick={() => {
                                                        updateCustomization({
                                                            primaryColor: preset.primary,
                                                            secondaryColor: preset.secondary,
                                                            accentColor: preset.accent
                                                        });
                                                    }}
                                                >
                                                    <div className="color-dot" style={{ background: preset.primary }} />
                                                    <div className="color-dot" style={{ background: preset.secondary }} />
                                                    <div className="color-dot" style={{ background: preset.accent }} />
                                                </button>
                                            ))}
                                        </div>

                                        <div className="custom-colors mt-4">
                                            <div className="color-input">
                                                <label>Cor Principal</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        value={customization.primaryColor}
                                                        onChange={(e) => updateCustomization('primaryColor', e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={customization.primaryColor}
                                                        onChange={(e) => updateCustomization('primaryColor', e.target.value)}
                                                        className="hex-input"
                                                    />
                                                </div>
                                            </div>
                                            <div className="color-input mt-2">
                                                <label>Secundária</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        value={customization.secondaryColor}
                                                        onChange={(e) => updateCustomization('secondaryColor', e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={customization.secondaryColor}
                                                        onChange={(e) => updateCustomization('secondaryColor', e.target.value)}
                                                        className="hex-input"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Cores de Elementos */}
                                        <div className="mt-6 pt-4 border-t border-gray-100">
                                            <h4 className="font-semibold text-gray-700 mb-4">Cores de Elementos</h4>

                                            <div className="color-input">
                                                <label>Botões - Fundo</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        value={customization.buttonBgColor || customization.primaryColor}
                                                        onChange={(e) => updateCustomization('buttonBgColor', e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={customization.buttonBgColor || ''}
                                                        placeholder="Usar primária"
                                                        onChange={(e) => updateCustomization('buttonBgColor', e.target.value || undefined)}
                                                        className="hex-input"
                                                    />
                                                </div>
                                            </div>

                                            <div className="color-input mt-2">
                                                <label>Botões - Texto</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        value={customization.buttonTextColor || '#ffffff'}
                                                        onChange={(e) => updateCustomization('buttonTextColor', e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={customization.buttonTextColor || ''}
                                                        placeholder="#ffffff"
                                                        onChange={(e) => updateCustomization('buttonTextColor', e.target.value || undefined)}
                                                        className="hex-input"
                                                    />
                                                </div>
                                            </div>

                                            <div className="color-input mt-2">
                                                <label>Rodapé - Fundo</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        value={customization.footerBgColor || '#1e293b'}
                                                        onChange={(e) => updateCustomization('footerBgColor', e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={customization.footerBgColor || ''}
                                                        placeholder="#1e293b"
                                                        onChange={(e) => updateCustomization('footerBgColor', e.target.value || undefined)}
                                                        className="hex-input"
                                                    />
                                                </div>
                                            </div>

                                            <div className="color-input mt-2">
                                                <label>Rodapé - Texto</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        value={customization.footerTextColor || '#94a3b8'}
                                                        onChange={(e) => updateCustomization('footerTextColor', e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={customization.footerTextColor || ''}
                                                        placeholder="#94a3b8"
                                                        onChange={(e) => updateCustomization('footerTextColor', e.target.value || undefined)}
                                                        className="hex-input"
                                                    />
                                                </div>
                                            </div>

                                            <div className="color-input mt-2">
                                                <label>Ícones</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        value={customization.iconColor || customization.primaryColor}
                                                        onChange={(e) => updateCustomization('iconColor', e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={customization.iconColor || ''}
                                                        placeholder="Usar primária"
                                                        onChange={(e) => updateCustomization('iconColor', e.target.value || undefined)}
                                                        className="hex-input"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TYPOGRAPHY TAB */}
                                {activeTab === 'typography' && (
                                    <div className="config-group">
                                        <label>Fonte Principal</label>
                                        <div className="font-options">
                                            {FONT_OPTIONS.map(font => (
                                                <div
                                                    key={font.id}
                                                    className={`font-option ${customization.fontFamily === font.id ? 'selected' : ''}`}
                                                    onClick={() => updateCustomization('fontFamily', font.id)}
                                                    style={{ fontFamily: font.name }}
                                                >
                                                    {font.name}
                                                    <span className="font-preview">Agende seu horário</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* IMAGES TAB */}
                                {activeTab === 'images' && (
                                    <div className="config-group">
                                        <div className="image-upload-section">
                                            <label>Logo da Loja</label>
                                            <div className="upload-area">
                                                {customization.logo ? (
                                                    <img src={customization.logo} alt="Logo" className="preview-img logo" />
                                                ) : (
                                                    <div className="placeholder-text text-sm text-gray-400 mb-2">Nenhum logo definido</div>
                                                )}
                                                <input
                                                    type="file"
                                                    id="logo-upload"
                                                    accept="image/*"
                                                    onChange={(e) => e.target.files?.[0] && handleImageUpload('logo', e.target.files[0])}
                                                    hidden
                                                />
                                                <div className="flex gap-2 justify-center">
                                                    <label htmlFor="logo-upload" className="upload-btn cursor-pointer">
                                                        {customization.logo ? 'Trocar' : 'Enviar Logo'}
                                                    </label>
                                                    {customization.logo && (
                                                        <button
                                                            className="upload-btn text-red-600 border-red-200 hover:bg-red-50"
                                                            onClick={() => updateCustomization('logo', null)}
                                                        >
                                                            Remover
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="image-upload-section mt-6">
                                            <label>Imagem de Capa</label>
                                            <div className="upload-area">
                                                {customization.coverImage ? (
                                                    <img src={customization.coverImage} alt="Cover" className="preview-img cover" />
                                                ) : (
                                                    <div className="placeholder-text text-sm text-gray-400 mb-2">Usando cor de fundo padrão</div>
                                                )}
                                                <input
                                                    type="file"
                                                    id="cover-upload"
                                                    accept="image/*"
                                                    onChange={(e) => e.target.files?.[0] && handleImageUpload('coverImage', e.target.files[0])}
                                                    hidden
                                                />
                                                <div className="flex gap-2 justify-center">
                                                    <label htmlFor="cover-upload" className="upload-btn cursor-pointer">
                                                        {customization.coverImage ? 'Trocar' : 'Enviar Capa'}
                                                    </label>
                                                    {customization.coverImage && (
                                                        <button
                                                            className="upload-btn text-red-600 border-red-200 hover:bg-red-50"
                                                            onClick={() => updateCustomization('coverImage', null)}
                                                        >
                                                            Remover
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="image-upload-section mt-6">
                                            <label>Imagem Sobre / Perfil</label>
                                            <div className="upload-area">
                                                {customization.aboutImage ? (
                                                    <img src={customization.aboutImage} alt="Sobre" className="preview-img cover" />
                                                ) : (
                                                    <div className="placeholder-text text-sm text-gray-400 mb-2">Usando padrão</div>
                                                )}
                                                <input
                                                    type="file"
                                                    id="about-upload"
                                                    accept="image/*"
                                                    onChange={(e) => e.target.files?.[0] && handleImageUpload('aboutImage', e.target.files[0])}
                                                    hidden
                                                />
                                                <div className="flex gap-2 justify-center">
                                                    <label htmlFor="about-upload" className="upload-btn cursor-pointer">
                                                        {customization.aboutImage ? 'Trocar' : 'Enviar Imagem'}
                                                    </label>
                                                    {customization.aboutImage && (
                                                        <button
                                                            className="upload-btn text-red-600 border-red-200 hover:bg-red-50"
                                                            onClick={() => updateCustomization('aboutImage', null)}
                                                        >
                                                            Remover
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Team Photos Section */}
                                        <div className="image-upload-section mt-6" id="team-images-section">
                                            <label className="font-semibold">Fotos da Equipe (Clínica)</label>
                                            <p className="text-xs text-gray-500 mb-3">Upload de fotos para os membros da equipe exibidos na landing page.</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[0, 1, 2, 3].map((idx) => (
                                                    <div key={idx} className="upload-area p-2">
                                                        <div className="text-xs text-gray-500 mb-1 text-center">Membro {idx + 1}</div>
                                                        {customization.teamImages?.[idx] ? (
                                                            <img
                                                                src={customization.teamImages[idx]}
                                                                alt={`Membro ${idx + 1}`}
                                                                className="w-16 h-16 rounded-full object-cover mx-auto mb-2"
                                                            />
                                                        ) : (
                                                            <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-2 flex items-center justify-center">
                                                                <span className="text-gray-400 text-xs">Foto</span>
                                                            </div>
                                                        )}
                                                        <input
                                                            type="file"
                                                            id={`team-photo-${idx}`}
                                                            accept="image/*"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    try {
                                                                        const base64 = await imageToBase64(file);
                                                                        const currentImages = customization.teamImages || [];
                                                                        const newImages = [...currentImages];
                                                                        newImages[idx] = base64;
                                                                        updateCustomization('teamImages', newImages);
                                                                    } catch (err) {
                                                                        console.error('Error uploading team photo:', err);
                                                                    }
                                                                }
                                                            }}
                                                            hidden
                                                        />
                                                        <div className="flex gap-1 justify-center">
                                                            <label htmlFor={`team-photo-${idx}`} className="upload-btn cursor-pointer text-xs py-1 px-2">
                                                                {customization.teamImages?.[idx] ? 'Trocar' : 'Enviar'}
                                                            </label>
                                                            {customization.teamImages?.[idx] && (
                                                                <button
                                                                    className="upload-btn text-red-600 border-red-200 hover:bg-red-50 text-xs py-1 px-2"
                                                                    onClick={() => {
                                                                        const currentImages = customization.teamImages || [];
                                                                        const newImages = [...currentImages];
                                                                        newImages[idx] = '';
                                                                        updateCustomization('teamImages', newImages);
                                                                    }}
                                                                >
                                                                    ×
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* SOCIAL TAB */}
                                {activeTab === 'social' && (
                                    <div className="config-group">
                                        <Input
                                            label="Instagram"
                                            placeholder="@usuario"
                                            value={customization.instagram || ''}
                                            onChange={(e) => updateCustomization('instagram', e.target.value)}
                                        />
                                        <Input
                                            label="WhatsApp"
                                            placeholder="(11) 99999-9999"
                                            value={customization.whatsapp || ''}
                                            onChange={(e) => updateCustomization('whatsapp', e.target.value)}
                                        />
                                        <Input
                                            label="Facebook"
                                            placeholder="Link ou usuário"
                                            value={customization.facebook || ''}
                                            onChange={(e) => updateCustomization('facebook', e.target.value)}
                                        />
                                    </div>
                                )}

                                {/* CONTENT TAB (Banner etc) */}
                                {activeTab === 'content' && (
                                    <div className="config-group">
                                        {/* Bio Section - Available for ALL Layouts */}
                                        <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-100">
                                            <h4 className="font-semibold text-primary-800 mb-2">Textos de Boas-vindas</h4>
                                            <Input
                                                label="Título Principal"
                                                placeholder="Olá, sou..."
                                                value={customization.welcomeTitle || ''}
                                                onChange={(e) => updateCustomization('welcomeTitle', e.target.value)}
                                            />
                                            <div className="form-group mt-2">
                                                <label className="form-label">Subtítulo / Mensagem</label>
                                                <textarea
                                                    className="form-input min-h-[100px]"
                                                    placeholder="Descreva sua experiência e abordagem..."
                                                    value={customization.welcomeMessage || ''}
                                                    onChange={(e) => updateCustomization('welcomeMessage', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* About Section - Available for ALL Layouts */}
                                        <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-100">
                                            <h4 className="font-semibold text-primary-800 mb-2">Seção Sobre</h4>
                                            <Input
                                                label="Título da Seção"
                                                placeholder="Ex: Sobre Mim / Nossa História"
                                                value={customization.aboutTitle || ''}
                                                onChange={(e) => updateCustomization('aboutTitle', e.target.value)}
                                            />
                                            <div className="form-group mt-2">
                                                <label className="form-label">Texto Sobre</label>
                                                <textarea
                                                    className="form-input min-h-[150px]"
                                                    placeholder="Conte sua história, formação e valores..."
                                                    value={customization.aboutText || ''}
                                                    onChange={(e) => updateCustomization('aboutText', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Specialties - Professional Only */}
                                        {customization.layout === 'psychology-office' && (
                                            <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-100">
                                                <h4 className="font-semibold text-primary-800 mb-2">Especialidades</h4>
                                                <div className="form-group">
                                                    <label className="text-sm text-gray-600 mb-1 block">Liste separado por vírgulas</label>
                                                    <textarea
                                                        className="form-input"
                                                        placeholder="Ex: Terapia de Casal, Ansiedade, Depressão..."
                                                        value={customization.specialties?.join(', ') || ''}
                                                        onChange={(e) => updateCustomization('specialties', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Gallery - Available for ALL Layouts */}
                                        <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-100">
                                            <h4 className="font-semibold text-primary-800 mb-2">Galeria de Fotos</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {[0, 1, 2, 3].map((idx) => (
                                                    <div key={idx} className="aspect-square bg-white rounded border border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden group">
                                                        {customization.galleryImages?.[idx] ? (
                                                            <>
                                                                <img src={customization.galleryImages[idx]} className="w-full h-full object-cover" />
                                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                                    <button
                                                                        onClick={() => {
                                                                            const newImages = [...(customization.galleryImages || [])];
                                                                            newImages.splice(idx, 1);
                                                                            // Se remover, arrays menores shiftam. Melhor manter undefined? 
                                                                            // Não, galleryImages é string[]. Se removermos idx, o proximo assume. O visual vai refletir array menor.
                                                                            // Mas nosso visualizador espera até 4 slots.
                                                                            // Então devemos garantir que tratamos a remoção corretamente.
                                                                            // Simplesmente removendo do array é o comportamento padrão de "lista de imagens".
                                                                            updateCustomization('galleryImages', newImages.filter((_, i) => i !== idx)); // Remove o item
                                                                        }}
                                                                        className="text-white bg-red-500 p-1 px-2 rounded-full text-xs hover:bg-red-600"
                                                                    >
                                                                        Remover
                                                                    </button>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <label className="cursor-pointer w-full h-full flex items-center justify-center flex-col text-xs text-gray-500 hover:text-primary-600 hover:bg-gray-50 transition-colors">
                                                                <ImageIcon size={16} className="mb-1 opacity-50" />
                                                                <span>+ Foto</span>
                                                                <input
                                                                    type="file"
                                                                    className="hidden"
                                                                    accept="image/*"
                                                                    onChange={async (e) => {
                                                                        if (e.target.files?.[0]) {
                                                                            try {
                                                                                const base64 = await imageToBase64(e.target.files[0]);
                                                                                const newImages = [...(customization.galleryImages || [])];
                                                                                // Se estamos adicionando num slot vazio que na verdade pode ser o final do array:
                                                                                // Se o array tem 2 items, idx 0 e 1 estao ocupados. idx 2 é novo. idx 3 é futuro.
                                                                                // Se clicamos no slot idx=0 mas ele ja tem imagem, não deveria cair aqui (if acima).
                                                                                // Se clicamos no slot idx=2 e array length é 2, é um push.
                                                                                // Mas como renderizamos 4 slots fixos baseado em [0,1,2,3], o comportamento precisa ser:
                                                                                // Se usuario clica no slot 3 mas array so tem 1 item, vamos dar push ou setar index 3?
                                                                                // O mais seguro para arrays simples é apenas dar push no final independente de qual "+" clicou se forem sequenciais visualmente.
                                                                                // Mas aqui eles parecem slots fixos.
                                                                                // Vamos simplificar: Ao adicionar, adiciona no final do array.
                                                                                newImages.push(base64);
                                                                                updateCustomization('galleryImages', newImages);
                                                                            } catch (err) {
                                                                                alert('Erro ao carregar imagem');
                                                                            }
                                                                        }
                                                                    }}
                                                                />
                                                            </label>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <label>Banner Promocional</label>
                                        <div className="toggle-row mb-2">
                                            <span>Ativar Banner</span>
                                            <input
                                                type="checkbox"
                                                checked={customization.bannerEnabled}
                                                onChange={(e) => updateCustomization('bannerEnabled', e.target.checked)}
                                            />
                                        </div>
                                        <Input
                                            label="Mensagem do Banner"
                                            placeholder="Ex: 20% OFF na primeira visita!"
                                            value={customization.bannerText || ''}
                                            onChange={(e) => updateCustomization('bannerText', e.target.value)}
                                            disabled={!customization.bannerEnabled}
                                        />

                                        <label className="mt-4">Exibição</label>
                                        <div className="toggles-list">
                                            <div className="toggle-row">
                                                <span>Mostrar Endereço</span>
                                                <input
                                                    type="checkbox"
                                                    checked={customization.showAddress}
                                                    onChange={(e) => updateCustomization('showAddress', e.target.checked)}
                                                />
                                            </div>
                                            <div className="toggle-row">
                                                <span>Mostrar Telefone</span>
                                                <input
                                                    type="checkbox"
                                                    checked={customization.showPhone}
                                                    onChange={(e) => updateCustomization('showPhone', e.target.checked)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ICON EDITOR TAB */}
                                {activeTab === 'icon-editor' && editingIconId && (
                                    <div className="config-group">
                                        <div className="mb-4">
                                            <h4 className="font-semibold text-primary-800 mb-1">Editar Ícone</h4>
                                            <p className="text-xs text-gray-500">
                                                Ícone selecionado: <strong>{editingIconId}</strong>
                                            </p>
                                        </div>

                                        <div className="mb-3">
                                            <label className="text-sm font-medium mb-2 block">Ícone Atual</label>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <DynamicIcon
                                                    name={customization.iconOverrides?.[editingIconId] || editingIconDefault}
                                                    size={32}
                                                />
                                                <span className="text-sm text-gray-600">
                                                    {customization.iconOverrides?.[editingIconId] || editingIconDefault}
                                                </span>
                                            </div>
                                        </div>

                                        <label className="text-sm font-medium mb-2 block">Selecione um Ícone</label>
                                        <div className="grid grid-cols-4 gap-2 max-h-[350px] overflow-y-auto p-2 bg-gray-50 rounded-lg">
                                            {POPULAR_ICONS.map((iconName) => (
                                                <button
                                                    key={iconName}
                                                    className={`aspect-square p-3 rounded-lg border-2 transition-all hover:bg-blue-50 hover:border-blue-400 flex items-center justify-center ${(customization.iconOverrides?.[editingIconId] || editingIconDefault) === iconName
                                                        ? 'bg-blue-100 border-blue-500 shadow-sm'
                                                        : 'border-gray-200 bg-white'
                                                        }`}
                                                    onClick={() => {
                                                        const currentOverrides = customization.iconOverrides || {};
                                                        updateCustomization('iconOverrides', {
                                                            ...currentOverrides,
                                                            [editingIconId]: iconName
                                                        });
                                                    }}
                                                    title={iconName}
                                                >
                                                    <DynamicIcon name={iconName} size={24} />
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            className="mt-4 w-full py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                                            onClick={() => {
                                                setEditingIconId(null);
                                                setActiveTab(null);
                                            }}
                                        >
                                            Fechar Editor
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </aside>

                {/* Preview Area */}
                <main className={`editor-preview ${viewMode}`}>
                    <div className="preview-device-frame">
                        <div className="visual-editor-preview-container">
                            <StoreBookingPage
                                isEditorMode={true}
                                customizationOverride={customization}
                                storeOverride={store}
                                onEditAction={handleEditAction}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
