import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Edit, Save } from 'lucide-react';
import Modal from './Modal';
import GradientButton from './GradientButton';

const EmergencyContactsModal = ({ isOpen, onClose, contacts, onSave }) => {
  const [contactsList, setContactsList] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', relation: '' });

  useEffect(() => {
    if (contacts) {
      setContactsList([...contacts]);
    }
  }, [contacts]);

  const handleAddContact = () => {
    setContactsList([...contactsList, { name: '', phone: '', relation: '' }]);
    setEditingIndex(contactsList.length);
    setEditForm({ name: '', phone: '', relation: '' });
  };

  const handleEditContact = (index) => {
    setEditingIndex(index);
    setEditForm({ ...contactsList[index] });
  };

  const handleSaveEdit = () => {
    const updatedContacts = [...contactsList];
    updatedContacts[editingIndex] = editForm;
    setContactsList(updatedContacts);
    setEditingIndex(null);
    setEditForm({ name: '', phone: '', relation: '' });
  };

  const handleDeleteContact = (index) => {
    const updatedContacts = contactsList.filter((_, i) => i !== index);
    setContactsList(updatedContacts);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleSave = () => {
    onSave(contactsList);
    onClose();
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal onClose={onClose}>
          <motion.div
            className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Emergency Contacts</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="space-y-4">
              {contactsList.map((contact, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  {editingIndex === index ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Name"
                        value={editForm.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={editForm.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
                      />
                      <input
                        type="text"
                        placeholder="Relation"
                        value={editForm.relation}
                        onChange={(e) => handleInputChange('relation', e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-medium transition-colors"
                        >
                          <Save className="w-4 h-4 inline mr-1" />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingIndex(null)}
                          className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">{contact.name}</h4>
                        <p className="text-sm text-white/60">{contact.relation}</p>
                        <p className="text-sm text-white/80">{contact.phone}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditContact(index)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-purple-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteContact(index)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={handleAddContact}
                className="w-full py-3 border-2 border-dashed border-white/20 rounded-lg text-white/60 hover:text-white hover:border-purple-400 transition-colors flex items-center justify-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Emergency Contact
              </button>
            </div>

            <div className="flex space-x-3 mt-6">
              <GradientButton
                onClick={handleSave}
                className="flex-1 flex items-center justify-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </GradientButton>
            </div>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default EmergencyContactsModal;