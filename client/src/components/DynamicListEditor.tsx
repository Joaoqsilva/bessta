import { useState } from 'react';
import { Plus, Trash, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';

interface DynamicListEditorProps<T> {
    items: T[];
    onUpdate: (items: T[]) => void;
    renderItem: (item: T, index: number, onChange: (updatedItem: T) => void) => React.ReactNode;
    createItem: () => T;
    title: string;
    addButtonLabel?: string;
    emptyMessage?: string;
}

export function DynamicListEditor<T extends { id: string }>({
    items = [],
    onUpdate,
    renderItem,
    createItem,
    title,
    addButtonLabel = "Adicionar",
    emptyMessage = "Nenhum item adicionado."
}: DynamicListEditorProps<T>) {
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

    const toggleItem = (id: string) => {
        setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleAdd = () => {
        const newItem = createItem();
        onUpdate([...items, newItem]);
        setOpenItems(prev => ({ ...prev, [newItem.id]: true })); // Auto-open new item
    };

    const handleRemove = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        onUpdate(newItems);
    };

    const handleChange = (index: number, updatedItem: T) => {
        const newItems = [...items];
        newItems[index] = updatedItem;
        onUpdate(newItems);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
                <span className="text-xs text-gray-500">{items.length} itens</span>
            </div>

            {items.length === 0 && (
                <div className="text-sm text-gray-400 italic text-center py-4 border border-dashed rounded bg-gray-50">
                    {emptyMessage}
                </div>
            )}

            <div className="space-y-2">
                {items.map((item, index) => (
                    <div key={item.id} className="border rounded bg-white shadow-sm overflow-hidden">
                        <div
                            className="bg-gray-50 px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => toggleItem(item.id)}
                        >
                            <div className="flex items-center gap-2">
                                <GripVertical size={14} className="text-gray-400" />
                                <span className="text-sm font-medium text-gray-700 max-w-[150px] truncate">
                                    {(item as any).title || (item as any).name || (item as any).question || `Item ${index + 1}`}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleRemove(index); }}
                                    className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors"
                                    title="Remover"
                                >
                                    <Trash size={14} />
                                </button>
                                {openItems[item.id] ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
                            </div>
                        </div>

                        {openItems[item.id] && (
                            <div className="p-3 border-t bg-white">
                                {renderItem(item, index, (updated) => handleChange(index, updated))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <button
                onClick={handleAdd}
                className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
            >
                <Plus size={16} />
                {addButtonLabel}
            </button>
        </div>
    );
}
