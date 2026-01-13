import React, { useState, useEffect } from 'react';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { licenseApi } from '../../services/licenseApi';
import { Plus, Key, Copy, Trash, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import './MasterLicensesPage.css';

interface LicenseKey {
    _id: string;
    key: string;
    plan: string;
    status: 'active' | 'used' | 'revoked';
    generatedBy: { name: string };
    usedBy?: { name: string; email: string; storeName: string };
    usedAt?: string;
    createdAt: string;
}

export const MasterLicensesPage = () => {
    const [keys, setKeys] = useState<LicenseKey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showGenerateModal, setShowGenerateModal] = useState(false);

    // Generate Form
    const [plan, setPlan] = useState('pro');
    const [count, setCount] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedKeys, setGeneratedKeys] = useState<LicenseKey[]>([]);

    useEffect(() => {
        loadKeys();
    }, []);

    const loadKeys = async () => {
        setIsLoading(true);
        try {
            const response = await licenseApi.listKeys({ limit: 50 });
            if (response.success) {
                setKeys(response.keys);
            }
        } catch (error) {
            console.error('Error loading keys:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);
        try {
            const response = await licenseApi.generateKeys(plan, count);
            if (response.success) {
                setGeneratedKeys(response.keys);
                loadKeys(); // Refresh list
                // Don't close modal yet, show generated keys
            }
        } catch (error) {
            console.error('Error generating keys:', error);
            alert('Erro ao gerar chaves');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover esta chave?')) return;
        try {
            await licenseApi.revokeKey(id);
            loadKeys();
        } catch (error) {
            console.error('Error deleting key:', error);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // You could add a toast here
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    return (
        <div className="master-licenses-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Chaves de Ativação</h1>
                    <p className="page-subtitle">Gerencie licenças e ativações manuais de planos</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <Button variant="outline" onClick={loadKeys} title="Atualizar">
                        <RefreshCw size={18} />
                    </Button>
                    <Button variant="primary" onClick={() => {
                        setGeneratedKeys([]);
                        setShowGenerateModal(true);
                    }}>
                        <Plus size={18} />
                        Gerar Chaves
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Carregando...</div>
            ) : (
                <div className="licenses-table-container">
                    <table className="licenses-table">
                        <thead>
                            <tr>
                                <th>Chave</th>
                                <th>Plano</th>
                                <th>Status</th>
                                <th>Gerado em</th>
                                <th>Utilizado por</th>
                                <th>Uso em</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {keys.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                                        Nenhuma chave encontrada
                                    </td>
                                </tr>
                            ) : (
                                keys.map((license) => (
                                    <tr key={license._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span className="key-badge">{license.key}</span>
                                                <button className="copy-btn" onClick={() => copyToClipboard(license.key)} title="Copiar">
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`plan-badge plan-${license.plan}`}>
                                                {license.plan}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${license.status}`}>
                                                {license.status === 'active' ? <CheckCircle size={12} /> :
                                                    license.status === 'used' ? <Key size={12} /> : <XCircle size={12} />}
                                                {license.status === 'active' ? 'Disponível' :
                                                    license.status === 'used' ? 'Utilizada' : 'Revogada'}
                                            </span>
                                        </td>
                                        <td>{formatDate(license.createdAt)}</td>
                                        <td>
                                            {license.usedBy ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
                                                    <strong>{license.usedBy.storeName || license.usedBy.name}</strong>
                                                    <span style={{ color: '#94a3b8' }}>{license.usedBy.email}</span>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td>{formatDate(license.usedAt || '')}</td>
                                        <td>
                                            <button
                                                className="copy-btn"
                                                style={{ color: '#ef4444' }}
                                                onClick={() => handleDelete(license._id)}
                                                title="Revogar/Excluir"
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Generate Modal */}
            <Modal
                isOpen={showGenerateModal}
                onClose={() => setShowGenerateModal(false)}
                title="Gerar Novas Chaves"
            >
                {generatedKeys.length > 0 ? (
                    <div>
                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                            <div style={{ background: '#dcfce7', width: 50, height: 50, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: '#15803d' }}>
                                <CheckCircle size={32} />
                            </div>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#15803d' }}>{generatedKeys.length} Chaves Geradas!</h3>
                            <p style={{ color: '#64748b' }}>Copie as chaves abaixo e envie para os clientes.</p>
                        </div>

                        <div className="generated-keys-box">
                            {generatedKeys.map(k => (
                                <div key={k._id} className="generated-key-item">
                                    <span style={{ fontWeight: 600, color: '#334155' }}>{k.key}</span>
                                    <span style={{ fontSize: 12, color: '#94a3b8', marginRight: 'auto', marginLeft: 10 }}>({k.plan})</span>
                                    <button className="copy-btn" onClick={() => copyToClipboard(k.key)}>
                                        <Copy size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
                            <Button onClick={() => {
                                setGeneratedKeys([]);
                                setShowGenerateModal(false);
                            }}>
                                Fechar
                            </Button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleGenerate}>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#334155' }}>Plano</label>
                            <select
                                value={plan}
                                onChange={(e) => setPlan(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: 6,
                                    border: '1px solid #e2e8f0',
                                    backgroundColor: '#fff'
                                }}
                            >
                                <option value="start">Start</option>
                                <option value="professional">Professional</option>
                                <option value="business">Business</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#334155' }}>Quantidade</label>
                            <input
                                type="number"
                                min="1"
                                max="50"
                                value={count}
                                onChange={(e) => setCount(parseInt(e.target.value))}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: 6,
                                    border: '1px solid #e2e8f0'
                                }}
                            />
                        </div>

                        <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <Button type="button" variant="outline" onClick={() => setShowGenerateModal(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" variant="primary" isLoading={isGenerating}>
                                Gerar Chaves
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};
