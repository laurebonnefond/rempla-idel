/**
 * Couche d'abstraction de base de données.
 * Actuellement: LocalStorage.
 * Futur: Supabase / HDS. Il suffira de remplacer l'implémentation interne sans modifier les composants.
 */
const DB = {
    _prefix: 'rempla_idel_',

    async get(table) {
        const data = localStorage.getItem(this._prefix + table);
        return data ? JSON.parse(data) : [];
    },

    async getById(table, id) {
        const items = await this.get(table);
        return items.find(item => item.id === id);
    },

    async insert(table, payload) {
        const items = await this.get(table);
        payload.id = crypto.randomUUID();
        payload.created_at = new Date().toISOString();
        items.push(payload);
        this._save(table, items);
        return payload;
    },

    async update(table, id, updates) {
        const items = await this.get(table);
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updates, updated_at: new Date().toISOString() };
            this._save(table, items);
            return items[index];
        }
        return null;
    },

    async delete(table, id) {
        let items = await this.get(table);
        items = items.filter(item => item.id !== id);
        this._save(table, items);
    },

    _save(table, data) {
        localStorage.setItem(this._prefix + table, JSON.stringify(data));
    },

    // Export global pour la sauvegarde
    async exportAll() {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(this._prefix));
        const data = {};
        keys.forEach(k => data[k.replace(this._prefix, '')] = JSON.parse(localStorage.getItem(k)));
        return data;
    },

    async importAll(data) {
        Object.keys(data).forEach(table => {
            this._save(table, data[table]);
        });
    }
};

export default DB;
