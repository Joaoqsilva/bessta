import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Layout, Palette, Type, Image as ImageIcon, MessageCircle,
    Save, ArrowLeft, Monitor, Smartphone, Layers, Crown, CheckCircle, Unlock
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { POPULAR_ICONS, DynamicIcon } from '../../components/EditableIcon';
import { StoreBookingPage } from '../public/StoreBookingPage';
import { useAuth } from '../../context/AuthContext';
import { DynamicListEditor } from '../../components/DynamicListEditor';
import { paymentService } from '../../services/paymentService';
import {
    getStoreCustomization,
    saveStoreCustomization,
    type StoreCustomization,
    PRESET_COLORS,
    FONT_OPTIONS,
    LAYOUT_OPTIONS,
    BUTTON_STYLES,
    LAYOUT_SECTIONS,
    imageToBase64
} from '../../context/StoreCustomizationService';
import type { FAQItem, TestimonialItem, ServiceItem, TeamMember } from '../../types';
import './StoreVisualEditor.css';

type EditorTab = 'layout' | 'colors' | 'typography' | 'content' | 'social' | 'text-editor' | 'icon-editor' | 'sections';

// Helper to check if user has premium plan
const isPremiumPlan = (plan?: string | null): boolean => {
    return ['pro', 'professional', 'business'].includes(plan || '');
};

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

    // Image editing states
    const [editingImageKey, setEditingImageKey] = useState<string | null>(null);

    // Dynamic Section Editing
    const [activeDynamicSection, setActiveDynamicSection] = useState<'faq' | 'team' | 'testimonials' | 'services' | null>(null);

    // Premium Upgrade Modal
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // Pro plan check - fetched from backend subscription
    const [isPro, setIsPro] = useState<boolean>(() => {
        // Initial check from store context
        return isPremiumPlan(store?.plan);
    });

    // Load subscription status from backend on mount
    useEffect(() => {
        const loadSubscriptionStatus = async () => {
            try {
                const response = await paymentService.getSubscription();
                if (response.success && response.subscription) {
                    const plan = response.subscription.plan;
                    setIsPro(isPremiumPlan(plan));
                }
            } catch (error) {
                console.error('Error loading subscription status:', error);
                // Fallback to store?.plan check
                setIsPro(isPremiumPlan(store?.plan));
            }
        };

        loadSubscriptionStatus();
    }, [store?.id]);

    // Initialize customization state
    useEffect(() => {
        if (store?.id) {
            getStoreCustomization(store.id).then(setCustomization);
        }
    }, [store?.id]);

    // Update customization helper - now supports batch updates
    // Update customization helper - now supports batch updates and array indexing (key__index)
    const updateCustomization = (keyOrObject: string | Partial<StoreCustomization>, value?: any) => {
        if (!customization) return;

        setCustomization(prev => {
            if (!prev) return null;
            if (typeof keyOrObject === 'string') {
                // Handle array updates (e.g. galleryImages__0, teamImages__1)
                if (keyOrObject.includes('__')) {
                    const parts = keyOrObject.split('__');
                    // Ensure we only split on the LAST double underscore if there are multiple (though unlikely for these keys)
                    const indexStr = parts.pop();
                    const realKey = parts.join('__');
                    const index = parseInt(indexStr || '');

                    if (!isNaN(index) && realKey) {
                        const currentList = (prev as any)[realKey];
                        if (Array.isArray(currentList)) {
                            const newList = [...currentList];
                            // Ensure array is large enough
                            while (newList.length <= index) newList.push("");
                            newList[index] = value;
                            return { ...prev, [realKey]: newList };
                        }
                    }
                }

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

        // Check if user is trying to save a premium layout without premium plan
        const selectedLayout = LAYOUT_OPTIONS.find(l => l.id === customization.layout);
        if (selectedLayout?.isPremium && !isPro) {
            setShowUpgradeModal(true);
            return;
        }

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
    const handleImageUpload = async (key: string, file: File) => {
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
        // Init Defaults Logic
        if (action === 'init-services__' && defaultValue) {
            if (!customization?.servicesList || customization.servicesList.length === 0) {
                try {
                    updateCustomization('servicesList', JSON.parse(defaultValue));
                } catch (e) {
                    console.error("Failed to parse init-services", e);
                }
            }
            return;
        }
        if (action === 'init-testimonials__' && defaultValue) {
            if (!customization?.testimonials || customization.testimonials.length === 0) {
                try {
                    const parsed = JSON.parse(defaultValue);
                    // Check if parsed is array (legacy) or object with images
                    if (Array.isArray(parsed)) {
                        updateCustomization('testimonials', parsed);
                    } else {
                        updateCustomization('testimonials', parsed.testimonials);
                        if (parsed.images) {
                            updateCustomization('testimonialImages', parsed.images);
                        }
                    }
                } catch (e) {
                    console.error("Failed to parse init-testimonials", e);
                }
            }
            return;
        }
        if (action === 'init-faq__' && defaultValue) {
            if (!customization?.faq || customization.faq.length === 0) {
                try {
                    updateCustomization('faq', JSON.parse(defaultValue));
                } catch (e) {
                    console.error("Failed to parse init-faq", e);
                }
            }
            return;
        }

        if (action === 'init-team__' && defaultValue) {
            if (!customization?.team || customization.team.length === 0) {
                try {
                    const parsed = JSON.parse(defaultValue);
                    // Initialize team metadata
                    updateCustomization('team', parsed.team);
                    // Initialize team images if provided
                    if (parsed.images) {
                        updateCustomization('teamImages', parsed.images);
                    }
                } catch (e) {
                    console.error("Failed to parse init-team", e);
                }
            }
            return;
        }

        if (action === 'gallery-add') {
            setCustomization(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    galleryImages: [...(prev.galleryImages || []), ""]
                };
            });
            return;
        }
        if (action === 'service-add') {
            setCustomization(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    servicesList: [...(prev.servicesList || []), {
                        id: Date.now().toString(),
                        title: 'Novo Especialidade',
                        description: 'Descrição da especialidade.'
                    }]
                };
            });
            return;
        }
        if (action === 'faq-add') {
            setCustomization(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    faq: [...(prev.faq || []), {
                        id: Date.now().toString(),
                        question: 'Nova Pergunta?',
                        answer: 'Resposta da pergunta.'
                    }]
                };
            });
            return;
        }
        if (action === 'team-add') {
            setCustomization(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    team: [...(prev.team || []), {
                        id: Date.now().toString(),
                        name: 'Novo Profissional',
                        role: 'Especialista',
                        bio: 'Descrição do profissional.'
                    }],
                    teamImages: [...(prev.teamImages || []), ""]
                };
            });
            return;
        }

        if (action === 'testimonial-add') {
            setCustomization(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    testimonials: [...(prev.testimonials || []), {
                        id: Date.now().toString(),
                        text: 'Depoimento incrível...',
                        author: 'Novo Cliente',
                        role: 'Cliente',
                        rating: 5
                    }],
                    testimonialImages: [...(prev.testimonialImages || []), ""]
                };
            });
            return;
        }

        // Generic Remove Handlers
        if (action.startsWith('service-remove__')) {
            const index = parseInt(action.split('__')[1]);
            setCustomization(prev => {
                if (!prev || !prev.servicesList) return prev;
                const newList = [...prev.servicesList];
                newList.splice(index, 1);
                return { ...prev, servicesList: newList };
            });
            return;
        }
        if (action.startsWith('faq-remove__')) {
            const index = parseInt(action.split('__')[1]);
            setCustomization(prev => {
                if (!prev || !prev.faq) return prev;
                const newList = [...prev.faq];
                newList.splice(index, 1);
                return { ...prev, faq: newList };
            });
            return;
        }
        // Gallery remove is often handled via the image modal, but we can support direct remove too
        if (action.startsWith('gallery-remove__')) {
            const index = parseInt(action.split('__')[1]);
            setCustomization(prev => {
                if (!prev || !prev.galleryImages) return prev;
                const newImages = [...prev.galleryImages];
                newImages.splice(index, 1);
                return { ...prev, galleryImages: newImages };
            });
            return;
        }
        if (action.startsWith('team-remove__')) {
            const index = parseInt(action.split('__')[1]);
            setCustomization(prev => {
                if (!prev || !prev.team) return prev;
                const newTeam = [...prev.team];
                newTeam.splice(index, 1);

                // Sync images removal
                const newImages = prev.teamImages ? [...prev.teamImages] : [];
                if (newImages.length > index) {
                    newImages.splice(index, 1);
                }

                return { ...prev, team: newTeam, teamImages: newImages };
            });
            return;
        }
        if (action.startsWith('testimonial-remove__')) {
            const index = parseInt(action.split('__')[1]);
            setCustomization(prev => {
                if (!prev || !prev.testimonials) return prev;
                const newTestimonials = [...prev.testimonials];
                newTestimonials.splice(index, 1);

                // Sync images removal
                const newImages = prev.testimonialImages ? [...prev.testimonialImages] : [];
                if (newImages.length > index) {
                    newImages.splice(index, 1);
                }

                return { ...prev, testimonials: newTestimonials, testimonialImages: newImages };
            });
            return;
        }
        if (action.startsWith('testimonial-rating__')) {
            const parts = action.split('__');
            const index = parseInt(parts[1]);
            const rating = parseInt(parts[2]);
            setCustomization(prev => {
                if (!prev || !prev.testimonials) return prev;
                const newList = [...prev.testimonials];
                if (newList[index]) {
                    newList[index] = { ...newList[index], rating: rating };
                }
                return { ...prev, testimonials: newList };
            });
            return;
        }
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
        // Handle image edit actions
        if (action.startsWith('image-edit__')) {
            const key = action.split('image-edit__')[1];
            setEditingImageKey(key);
            return;
        }
        // Handle team photo uploads
        // Handle team photo uploads (Legacy/Redirect)
        if (action.startsWith('team-photo-')) {
            setActiveTab('sections');
            setActiveDynamicSection('team');
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
            case 'about-image':
            case 'cover-image':
            case 'logo':
                // Retroactive support for old calls, redirect to new image editor
                setEditingImageKey(action === 'cover-image' ? 'coverImage' : action === 'about-image' ? 'aboutImage' : 'logo');
                break;
            case 'about-section':
                setActiveTab('content');
                break;
            case 'socialLinks':
                // Handle social links update from EditableSocialLink component
                if (defaultValue) {
                    try {
                        const links = JSON.parse(defaultValue);
                        updateCustomization('socialLinks', links);
                    } catch (e) {
                        console.error('Failed to parse socialLinks:', e);
                    }
                }
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
                            className={`tool-btn ${activeTab === 'social' ? 'active' : ''}`}
                            onClick={() => setActiveTab(activeTab === 'social' ? null : 'social')}
                        >
                            <MessageCircle size={20} />
                            <span>Redes</span>
                        </button>
                        <button
                            className={`tool-btn ${activeTab === 'sections' ? 'active' : ''}`}
                            onClick={() => setActiveTab(activeTab === 'sections' ? null : 'sections')}
                        >
                            <Layers size={20} />
                            <span>Seções</span>
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
                                    {activeTab === 'content' && 'Conteúdo'}
                                    {activeTab === 'social' && 'Redes Sociais'}
                                    {activeTab === 'sections' && 'Gerenciar Seções'}
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

                                                    // HANDLE DYNAMIC LIST UPDATES
                                                    // Maps specific IDs to array updates to ensure Add/Remove sync works
                                                    const dynamicUpdate = (id: string, value: string) => {
                                                        const updateArrayItem = (listKey: keyof StoreCustomization, index: number, field: string) => {
                                                            const list = customization[listKey];
                                                            if (Array.isArray(list) && list[index]) {
                                                                const newList = [...list] as any[];
                                                                newList[index] = { ...newList[index], [field]: value };
                                                                updateCustomization(listKey, newList);
                                                                return true;
                                                            }
                                                            return false;
                                                        };

                                                        // Services
                                                        const svcMatch =
                                                            id.match(/^(?:cl_svc_title_|beauty_svc_title_|mod_serv_t_|vt_srv_t|sunny_srv_title_|vib_srv_t_)(\d+)/) ||
                                                            id.match(/^(?:cl_svc_desc_|beauty_svc_desc_|mod_serv_d_|vt_srv_d)(\d+)/) ||
                                                            id.match(/^(?:beauty_svc_price_)(\d+)/);

                                                        if (svcMatch) {
                                                            const idx = parseInt(svcMatch[1]);
                                                            if (id.includes('title') || id.includes('_t_') || id.endsWith('_t' + idx)) return updateArrayItem('servicesList', idx, 'title');
                                                            if (id.includes('desc') || id.includes('_d_') || id.endsWith('_d' + idx)) return updateArrayItem('servicesList', idx, 'description');
                                                            if (id.includes('price')) return updateArrayItem('servicesList', idx, 'price');
                                                        }

                                                        // FAQ
                                                        const faqMatch =
                                                            id.match(/^(?:cl_faq_q_|mod_faq_q_|vt_fq_q|soph_faq_q_|harmony_faq_q_|therapy_faq_q_)(\d+)/) ||
                                                            id.match(/^(?:cl_faq_a_|mod_faq_a_|vt_fq_a)(\d+)/);

                                                        if (faqMatch) {
                                                            const idx = parseInt(faqMatch[1]);
                                                            if (id.includes('_q')) return updateArrayItem('faq', idx, 'question');
                                                            if (id.includes('_a')) return updateArrayItem('faq', idx, 'answer');
                                                        }

                                                        // Testimonials
                                                        const testMatch =
                                                            id.match(/^(?:cl_test_text_|beauty_test_txt_|vt_rev_t|hm_tst_t|sn_rev_t|th_rev_txt_|soph_test_t|mod_test_t|psy_test_t)(\d+)/) ||
                                                            id.match(/^(?:cl_test_author_|beauty_test_author_|vt_rev_a|hm_tst_a|sn_rev_a|th_rev_auth_|soph_test_a|mod_test_a|psy_test_a)(\d+)/) ||
                                                            id.match(/^(?:cl_test_role_|soph_test_r|mod_test_r|psy_test_r)(\d+)/);

                                                        if (testMatch) {
                                                            const idx = parseInt(testMatch[1]);
                                                            if (id.includes('text') || id.includes('txt') || id.endsWith('_t' + idx)) return updateArrayItem('testimonials', idx, 'text');
                                                            if (id.includes('author') || id.includes('auth') || id.endsWith('_a' + idx)) return updateArrayItem('testimonials', idx, 'author');
                                                            if (id.includes('role') || id.endsWith('_r' + idx)) return updateArrayItem('testimonials', idx, 'role');
                                                        }

                                                        // Team (New)
                                                        const teamMatch =
                                                            id.match(/^(?:soph_team_n|mod_team_n|psy_team_n|beauty_team_n|th_team_n)(\d+)/) ||
                                                            id.match(/^(?:soph_team_r|mod_team_r|psy_team_r|beauty_team_r|th_team_r)(\d+)/) ||
                                                            id.match(/^(?:soph_team_b|mod_team_b|psy_team_b|beauty_team_b|th_team_b)(\d+)/);

                                                        if (teamMatch) {
                                                            const idx = parseInt(teamMatch[1]);
                                                            if (id.includes('_n')) return updateArrayItem('team', idx, 'name');
                                                            if (id.includes('_r')) return updateArrayItem('team', idx, 'role');
                                                            if (id.includes('_b')) return updateArrayItem('team', idx, 'bio');
                                                        }

                                                        return false;
                                                    };

                                                    // Attempt dynamic update first
                                                    const handled = dynamicUpdate(editingTextId, val);

                                                    // ALWAYS update "textOverrides" as well for immediate feedback and as fallback
                                                    // This ensures that even if array is empty (using defaults), text edits still appear visually
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
                                                />                                            </div>
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
                                            {LAYOUT_OPTIONS.map(layout => {
                                                const isPremiumLayout = layout.isPremium && !isPro;
                                                return (
                                                    <div
                                                        key={layout.id}
                                                        className={`card-option ${customization.layout === layout.id ? 'selected' : ''}`}
                                                        onClick={() => updateCustomization('layout', layout.id)}
                                                        style={isPremiumLayout ? { borderColor: 'rgba(255, 193, 7, 0.3)' } : {}}
                                                    >
                                                        <span className="option-name">{layout.name}</span>
                                                        {layout.isPremium && (
                                                            isPro ? (
                                                                <span style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    marginLeft: '8px',
                                                                    fontSize: '0.65rem',
                                                                    fontWeight: 600,
                                                                    color: '#10b981',
                                                                    background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                                                                    padding: '2px 6px',
                                                                    borderRadius: '4px',
                                                                    border: '1px solid #a7f3d0'
                                                                }}>
                                                                    <Unlock size={10} />
                                                                    Desbloqueado
                                                                </span>
                                                            ) : (
                                                                <span style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    marginLeft: '8px',
                                                                    fontSize: '0.7rem',
                                                                    fontWeight: 600,
                                                                    color: '#FFC107',
                                                                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                                                                    padding: '2px 6px',
                                                                    borderRadius: '4px'
                                                                }}>
                                                                    <Crown size={10} />
                                                                    PRO
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {!isPro && (
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '12px', fontStyle: 'italic' }}>
                                                💡 Você pode visualizar todos os layouts! Faça upgrade para PRO para salvar com layouts premium.
                                            </p>
                                        )}
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

                                {/* SECTIONS TAB */}
                                {activeTab === 'sections' && (
                                    <div className="config-group">
                                        {activeDynamicSection ? (
                                            <div className="animate-fade-in">
                                                <button
                                                    onClick={() => setActiveDynamicSection(null)}
                                                    className="flex items-center text-sm text-gray-500 mb-4 hover:text-gray-700"
                                                >
                                                    <ArrowLeft size={16} className="mr-1" />
                                                    Voltar para Seções
                                                </button>

                                                {/* FAQ EDITOR */}
                                                {activeDynamicSection === 'faq' && (
                                                    <DynamicListEditor<FAQItem>
                                                        title="Perguntas Frequentes"
                                                        items={customization.faq || []}
                                                        onUpdate={(items) => updateCustomization('faq', items)}
                                                        createItem={() => ({ id: Math.random().toString(36).substr(2, 9), question: 'Nova Pergunta', answer: 'Resposta aqui...' })}
                                                        renderItem={(item, index, onChange) => (
                                                            <div className="space-y-3">
                                                                <Input
                                                                    label="Pergunta"
                                                                    value={item.question}
                                                                    onChange={(e) => onChange({ ...item, question: e.target.value })}
                                                                />
                                                                <div>
                                                                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Resposta</label>
                                                                    <textarea
                                                                        className="form-input min-h-[80px]"
                                                                        value={item.answer}
                                                                        onChange={(e) => onChange({ ...item, answer: e.target.value })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    />
                                                )}

                                                {/* TESTIMONIALS EDITOR */}
                                                {activeDynamicSection === 'testimonials' && (
                                                    <DynamicListEditor<TestimonialItem>
                                                        title="Depoimentos"
                                                        items={customization.testimonials || []}
                                                        onUpdate={(items) => updateCustomization('testimonials', items)}
                                                        createItem={() => ({ id: Math.random().toString(36).substr(2, 9), text: 'O melhor atendimento que já tive.', author: 'Nome do Paciente', role: 'Paciente' })}
                                                        renderItem={(item, index, onChange) => (
                                                            <div className="space-y-3">
                                                                <div>
                                                                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Depoimento</label>
                                                                    <textarea
                                                                        className="form-input min-h-[80px]"
                                                                        value={item.text}
                                                                        onChange={(e) => onChange({ ...item, text: e.target.value })}
                                                                    />
                                                                </div>
                                                                <Input
                                                                    label="Autor"
                                                                    value={item.author}
                                                                    onChange={(e) => onChange({ ...item, author: e.target.value })}
                                                                />
                                                                <Input
                                                                    label="Cargo / Tipo (Opcional)"
                                                                    value={item.role || ''}
                                                                    onChange={(e) => onChange({ ...item, role: e.target.value })}
                                                                />
                                                            </div>
                                                        )}
                                                    />
                                                )}

                                                {/* TEAM EDITOR */}
                                                {activeDynamicSection === 'team' && (
                                                    <DynamicListEditor<TeamMember>
                                                        title="Membros da Equipe"
                                                        items={customization.team || []}
                                                        onUpdate={(items) => updateCustomization('team', items)}
                                                        createItem={() => ({ id: Math.random().toString(36).substr(2, 9), name: 'Dr. Nome', role: 'Especialista' })}
                                                        renderItem={(item, index, onChange) => (
                                                            <div className="space-y-3">
                                                                <Input
                                                                    label="Nome"
                                                                    value={item.name}
                                                                    onChange={(e) => onChange({ ...item, name: e.target.value })}
                                                                />
                                                                <Input
                                                                    label="Cargo / Especialidade"
                                                                    value={item.role}
                                                                    onChange={(e) => onChange({ ...item, role: e.target.value })}
                                                                />
                                                            </div>
                                                        )}
                                                    />
                                                )}

                                                {/* SERVICES EDITOR */}
                                                {activeDynamicSection === 'services' && (
                                                    <DynamicListEditor<ServiceItem>
                                                        title="Serviços / Especialidades"
                                                        items={customization.servicesList || []}
                                                        onUpdate={(items) => updateCustomization('servicesList', items)}
                                                        createItem={() => ({ id: Math.random().toString(36).substr(2, 9), title: 'Novo Serviço', description: 'Descrição do serviço...' })}
                                                        renderItem={(item, index, onChange) => (
                                                            <div className="space-y-3">
                                                                <Input
                                                                    label="Título"
                                                                    value={item.title}
                                                                    onChange={(e) => onChange({ ...item, title: e.target.value })}
                                                                />
                                                                <div>
                                                                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Descrição</label>
                                                                    <textarea
                                                                        className="form-input min-h-[80px]"
                                                                        value={item.description}
                                                                        onChange={(e) => onChange({ ...item, description: e.target.value })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    />
                                                )}

                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-sm text-gray-500 mb-4">Gerencie as seções da sua Landing Page.</p>

                                                {/* Seções dinâmicas baseadas no layout selecionado */}
                                                {(LAYOUT_SECTIONS[customization.layout] || []).map(section => {
                                                    // Determinar se é uma seção com conteúdo gerenciável
                                                    const dynamicKeys: Record<string, string> = {
                                                        'services': 'services',
                                                        'team': 'team',
                                                        'testimonials': 'testimonials',
                                                        'faq': 'faq'
                                                    };
                                                    const isDynamic = !!dynamicKeys[section.id];
                                                    const dynamicKey = dynamicKeys[section.id];

                                                    return (
                                                        <div key={section.id} className="flex flex-col p-3 bg-white border border-gray-100 rounded-lg mb-2 shadow-sm hover:border-blue-100 transition-colors">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-medium text-gray-700">{section.name}</span>
                                                                <label className="relative inline-flex items-center cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="sr-only peer"
                                                                        checked={customization.visibleSections?.[section.id] !== false}
                                                                        onChange={(e) => {
                                                                            const currentSections = customization.visibleSections || {};
                                                                            updateCustomization('visibleSections', {
                                                                                ...currentSections,
                                                                                [section.id]: e.target.checked
                                                                            });
                                                                        }}
                                                                    />
                                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                                </label>
                                                            </div>

                                                            {/* Show Manage Button if enabled and dynamic */}
                                                            {isDynamic && customization.visibleSections?.[section.id] !== false && (
                                                                <button
                                                                    onClick={() => setActiveDynamicSection(dynamicKey as any)}
                                                                    className="mt-3 text-sm flex items-center justify-center py-1.5 px-3 bg-gray-50 text-gray-600 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-200"
                                                                >
                                                                    Gerenciar Conteúdo
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}

                                                <p className="text-xs text-gray-400 mt-4 italic">
                                                    Nota: Ocultar o 'Hero' ou 'Contato' não é recomendado para conversão.
                                                </p>
                                            </>
                                        )}
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

                                        {/* Specialties - Available for Therapy/Clinic Layouts */}
                                        {['therapy-new', 'clinic-new', 'harmony-new', 'sophisticated-therapy', 'modern-therapy', 'lacanian-clinic'].includes(customization.layout || '') && (
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
            {/* IMAGE EDITOR MODAL */}
            {editingImageKey && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={() => setEditingImageKey(null)}>
                    <div className="bg-white rounded-xl shadow-2xl w-[400px] p-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4">Editar Imagem</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            {editingImageKey === 'logo' && 'Logo da Loja'}
                            {editingImageKey === 'coverImage' && 'Imagem de Capa'}
                            {editingImageKey === 'aboutImage' && 'Imagem de Perfil / Sobre'}
                            {editingImageKey.startsWith('teamImages') && 'Foto da Equipe'}
                            {!['logo', 'coverImage', 'aboutImage'].includes(editingImageKey) && !editingImageKey.startsWith('teamImages') && 'Imagem do Componente'}
                        </p>

                        <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-dashed border-gray-200">
                            {/* Logic to determine current image URL based on key */}
                            {(() => {
                                let currentUrl: string | null = null;
                                if (editingImageKey === 'logo') currentUrl = customization.logo ?? null;
                                else if (editingImageKey === 'coverImage') currentUrl = customization.coverImage ?? null;
                                else if (editingImageKey === 'aboutImage') currentUrl = customization.aboutImage ?? null;
                                else if (editingImageKey.includes('.')) {
                                    // Handle nested keys if applicable later, or specific complex keys
                                } else if (editingImageKey.startsWith('teamImages__')) {
                                    const idx = parseInt(editingImageKey.split('__')[1]);
                                    currentUrl = customization.teamImages?.[idx] ?? null;
                                } else if (editingImageKey.startsWith('galleryImages__')) {
                                    const idx = parseInt(editingImageKey.split('__')[1]);
                                    currentUrl = customization.galleryImages?.[idx] ?? null;
                                }

                                return currentUrl ? (
                                    <img src={currentUrl} alt="Preview" className="max-h-[200px] mx-auto rounded shadow-sm" />
                                ) : (
                                    <div className="h-[150px] flex items-center justify-center text-gray-300">
                                        <ImageIcon size={48} />
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="flex gap-3 justify-center">
                            <label className="btn-primary cursor-pointer px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                                Escolher Imagem
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            try {
                                                const base64 = await imageToBase64(file);
                                                if (editingImageKey.startsWith('teamImages__')) {
                                                    const idx = parseInt(editingImageKey.split('__')[1]);
                                                    const currentTeam = [...(customization.teamImages || [])];
                                                    currentTeam[idx] = base64;
                                                    updateCustomization('teamImages', currentTeam);
                                                } else if (editingImageKey.startsWith('galleryImages__')) {
                                                    const idx = parseInt(editingImageKey.split('__')[1]);
                                                    const currentGallery = [...(customization.galleryImages || [])];
                                                    // Ensure array is large enough if filling a specific slot
                                                    while (currentGallery.length <= idx) currentGallery.push("");
                                                    currentGallery[idx] = base64;
                                                    updateCustomization('galleryImages', currentGallery);
                                                } else {
                                                    // Cast to any to allow dynamic key access/update
                                                    updateCustomization(editingImageKey as any, base64);
                                                }
                                                setEditingImageKey(null);
                                            } catch (err) {
                                                console.error(err);
                                                alert('Erro ao processar imagem');
                                            }
                                        }
                                    }}
                                />
                            </label>

                            <button
                                className="px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                                onClick={() => {
                                    if (editingImageKey.startsWith('teamImages__')) {
                                        const idx = parseInt(editingImageKey.split('__')[1]);
                                        const currentTeam = [...(customization.teamImages || [])];
                                        currentTeam[idx] = '';
                                        updateCustomization('teamImages', currentTeam);
                                    } else if (editingImageKey.startsWith('galleryImages__')) {
                                        const idx = parseInt(editingImageKey.split('__')[1]);
                                        const currentGallery = [...(customization.galleryImages || [])];
                                        // The following block is likely intended for the handleEditAction function, not here.
                                        // However, following the instruction to insert it at this specific location.
                                        // This will cause a syntax error as 'section' and 'setCustomization' are not defined here.
                                        // If this is a mistake in the instruction, please clarify.
                                        // For now, inserting as requested.


                                        // For gallery, removing an image usually means setting it to empty string to preserve layout or splice.
                                        // We will set to empty string for now to support "placeholder" state.
                                        currentGallery[idx] = '';
                                        updateCustomization('galleryImages', currentGallery);
                                        setEditingImageKey(null);
                                    }
                                }}
                            >
                                Remover
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Upgrade Modal */}
            {showUpgradeModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                        borderRadius: '20px',
                        padding: '2.5rem',
                        maxWidth: '440px',
                        width: '90%',
                        textAlign: 'center',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(255, 193, 7, 0.3)',
                        animation: 'fadeIn 0.2s ease-out'
                    }}>
                        {/* Crown Icon */}
                        <div style={{
                            width: '70px',
                            height: '70px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #FFC107 0%, #FF9800 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            boxShadow: '0 8px 20px rgba(255, 193, 7, 0.4)'
                        }}>
                            <Crown size={36} color="#1a1a2e" />
                        </div>

                        {/* Title */}
                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: '#fff',
                            marginBottom: '0.75rem'
                        }}>
                            Layout Exclusivo PRO
                        </h3>

                        {/* Description */}
                        <p style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.95rem',
                            lineHeight: 1.6,
                            marginBottom: '1.5rem'
                        }}>
                            O layout selecionado é exclusivo do plano <strong style={{ color: '#FFC107' }}>PRO</strong>.
                            Faça upgrade para desbloquear todos os layouts premium e recursos avançados!
                        </p>

                        {/* Free layouts hint */}
                        <p style={{
                            color: 'rgba(255, 255, 255, 0.5)',
                            fontSize: '0.85rem',
                            marginBottom: '2rem'
                        }}>
                            Layouts gratuitos: <strong>Sofisticado</strong> e <strong>Moderno</strong>
                        </p>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowUpgradeModal(false)}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    background: 'transparent',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    fontSize: '0.95rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                    e.currentTarget.style.color = '#fff';
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                                }}
                            >
                                Voltar
                            </button>
                            <button
                                onClick={() => {
                                    setShowUpgradeModal(false);
                                    navigate('/app/settings?tab=plans');
                                }}
                                style={{
                                    padding: '12px 28px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #FFC107 0%, #FF9800 100%)',
                                    color: '#1a1a2e',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 15px rgba(255, 193, 7, 0.4)'
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 193, 7, 0.5)';
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 193, 7, 0.4)';
                                }}
                            >
                                Fazer Upgrade
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
