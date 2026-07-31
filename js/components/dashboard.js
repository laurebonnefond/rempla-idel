import DB from '../data/db.js';
import AI from '../utils/ai.js';
import { formatCurrency } from '../utils/helpers.js';

const Dashboard = {
    async render() {
        const replacements = await DB.get('replacements');
        const now = new Date();
        const monthReplacements = replacements.filter(r => new Date(r.date).getMonth() === now.getMonth() && r.status !== 'Annulé');
        
        const monthlyRevenue = monthReplacements.reduce((sum, r) => sum + (r.payment_received || 0), 0);
        const pendingPayments = monthReplacements.filter(r => r.status === 'Facturé' || r.status === 'En attente').length;
        const monthlyKm = 1200; // Simulation calcul km
        
        const aiAdvices = await AI.analyze();

        return `
            <h1 style="margin-bottom:16px;">Tableau de bord</h1>
            <div class="stat-grid">
                <div class="card">
                    <h3>${monthReplacements.length}</h3>
                    <p>Remplacements ce mois</p>
                </div>
                <div class="card">
                    <h3>${formatCurrency(monthlyRevenue)}</h3>
                    <p>Revenus encaissés</p>
                </div>
                <div class="card">
                    <h3>${pendingPayments}</h3>
                    <p>Paiements en attente</p>
                </div>
                <div class="card">
                    <h3>${monthlyKm} km</h3>
                    <p>Kilométrage</p>
                </div>
            </div>

            <div class="card" style="background:var(--md-primary-container); color:var(--md-on-surface);">
                <h3 style="display:flex; align-items:center; gap:8px; margin-bottom:10px;"><i data-lucide="bot"></i> Assistant IA</h3>
                <ul style="list-style:none; padding:0;">
                    ${aiAdvices.map(a => `<li style="margin-bottom:8px; font-size:14px;">${a}</li>`).join('')}
                </ul>
                <button id="voice-cmd-btn" class="btn-outline" style="margin-top:10px;">
                    <i data-lucide="mic"></i> Commande vocale
                </button>
            </div>
        `;
    },

    init() {
        document.getElementById('voice-cmd-btn')?.addEventListener('click', () => this.voiceCommand());
    },

    voiceCommand() {
        // Implémentation Web Speech API
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'fr-FR';
        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            const cabinets = await DB.get('cabinets');
            const parsed = AI.processNaturalLanguage(transcript, cabinets);
            if (parsed) {
                await DB.insert('replacements', parsed);
                alert(`Remplacement ajouté: ${transcript}`);
                Layout.navigate('dashboard');
            } else {
                alert("Désolé, je n'ai pas compris. Précisez le jour et le cabinet.");
            }
        };
        recognition.start();
    }
};

export default Dashboard;
