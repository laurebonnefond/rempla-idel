import DB from '../data/db.js';
import { openModal, closeModal, showSnackbar } from '../utils/helpers.js';

const Cabinets = {
    async render() {
        const cabinets = await DB.get('cabinets');
        return `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h1>Cabinets</h1>
                <button class="btn" id="add-cab-btn"><i data-lucide="plus"></i> Ajouter</button>
            </div>
            <div id="cabinets-list">
                ${cabinets.map(c => `
                    <div class="card" data-id="${c.id}" style="border-left: 5px solid ${c.color};">
                        <h3>${c.name}</h3>
                        <p>${c.address || ''}</p>
                        <p style="font-size:12px; color:var(--md-outline);">Logiciel: ${c.software || 'N/A'}</p>
                    </div>
                `).join('')}
            </div>
        `;
    },

    init() {
        document.getElementById('add-cab-btn').addEventListener('click', () => this.showForm());
    },

    showForm() {
        openModal(`
            <h2>Nouveau cabinet</h2>
            <form id="cab-form">
                <input type="text" class="input-field" id="cab-name" placeholder="Nom du cabinet" required>
                <input type="color" class="input-field" id="cab-color" value="#006A6A" title="Couleur">
                <input type="text" class="input-field" id="cab-address" placeholder="Adresse">
                <input type="text" class="input-field" id="cab-gps" placeholder="Coordonnées GPS">
                <input type="tel" class="input-field" id="cab-phone" placeholder="Téléphone">
                <input type="text" class="input-field" id="cab-digicode" placeholder="Digicode">
                <input type="text" class="input-field" id="cab-software" placeholder="Logiciel métier (ex: Cabestan)">
                <textarea class="input-field" id="cab-notes" placeholder="Remarques (Parking, clés...)"></textarea>
                <button type="submit" class="btn" style="width:100%; justify-content:center;">Enregistrer</button>
            </form>
        `);

        document.getElementById('cab-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const newCab = {
                name: document.getElementById('cab-name').value,
                color: document.getElementById('cab-color').value,
                address: document.getElementById('cab-address').value,
                gps: document.getElementById('cab-gps').value,
                phone: document.getElementById('cab-phone').value,
                digicode: document.getElementById('cab-digicode').value,
                software: document.getElementById('cab-software').value,
                notes: document.getElementById('cab-notes').value
            };
            await DB.insert('cabinets', newCab);
            closeModal();
            showSnackbar('Cabinet ajouté');
            Layout.navigate('cabinets');
        });
    }
};

export default Cabinets;
