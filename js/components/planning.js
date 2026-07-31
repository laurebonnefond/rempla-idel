import DB from '../data/db.js';
import { openModal, closeModal, showSnackbar } from '../utils/helpers.js';

const Planning = {
    async render() {
        const replacements = await DB.get('replacements');
        const cabinets = await DB.get('cabinets');
        
        const sortedReps = replacements.sort((a,b) => new Date(a.date) - new Date(b.date));

        return `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h1>Planning</h1>
                <button class="btn" id="add-rep-btn"><i data-lucide="plus"></i> Ajouter</button>
            </div>
            <div id="planning-list">
                ${sortedReps.map(r => {
                    const cab = cabinets.find(c => c.id === r.cabinet_id) || {name: 'Inconnu', color: '#CCC'};
                    return `
                        <div class="card" style="border-left: 5px solid ${cab.color};" data-id="${r.id}">
                            <h3>${new Date(r.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                            <p>${r.start_time} - ${r.end_time} | ${cab.name}</p>
                            <span style="font-size:12px; padding:4px 8px; border-radius:8px; background:var(--md-surface-variant);">${r.status}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    init() {
        document.getElementById('add-rep-btn').addEventListener('click', async () => {
            const cabinets = await DB.get('cabinets');
            this.showForm(cabinets);
        });
    },

    showForm(cabinets) {
        const today = new Date().toISOString().split('T')[0];
        openModal(`
            <h2>Nouveau remplacement</h2>
            <form id="rep-form">
                <input type="date" class="input-field" id="rep-date" value="${today}" required>
                <input type="time" class="input-field" id="rep-start" value="08:00" required>
                <input type="time" class="input-field" id="rep-end" value="12:00" required>
                <select class="input-field" id="rep-cabinet" required>
                    ${cabinets.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
                <textarea class="input-field" id="rep-obs" placeholder="Alias patient / Observation (Aucune donnée médicale)"></textarea>
                <input type="number" class="input-field" id="rep-pay" placeholder="Paiement prévu (€)">
                <select class="input-field" id="rep-status">
                    <option>En attente</option>
                    <option>Facturé</option>
                    <option>Payé</option>
                    <option>Annulé</option>
                </select>
                <button type="submit" class="btn" style="width:100%; justify-content:center;">Enregistrer</button>
            </form>
        `);

        document.getElementById('rep-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const newRep = {
                date: document.getElementById('rep-date').value,
                start_time: document.getElementById('rep-start').value,
                end_time: document.getElementById('rep-end').value,
                cabinet_id: document.getElementById('rep-cabinet').value,
                observation: document.getElementById('rep-obs').value,
                expected_payment: parseFloat(document.getElementById('rep-pay').value) || 0,
                payment_received: 0,
                status: document.getElementById('rep-status').value
            };
            await DB.insert('replacements', newRep);
            closeModal();
            showSnackbar('Remplacement ajouté avec succès');
            Layout.navigate('planning');
        });
    }
};

export default Planning;
