import DB from '../data/db.js';
import { formatCurrency } from './helpers.js';

/**
 * Moteur d'Intelligence Artificielle locale (Rule-based system).
 * Analyse les données et fournit des recommandations.
 */
const AI = {
    async analyze() {
        const replacements = await DB.get('replacements');
        const cabinets = await DB.get('cabinets');
        const stats = await this.calculateStats(replacements);
        const advice = [];

        // 1. Détection des conflits horaires
        advice.push(...this.detectConflicts(replacements));

        // 2. Journées trop longues (> 10h)
        advice.push(...this.detectLongDays(replacements));

        // 3. Paiements oubliés (Facturé il y a plus de 30 jours mais non payé)
        advice.push(...this.detectForgottenPayments(replacements));

        // 4. Analyse du cabinet le plus rentable
        if (cabinets.length > 0) {
            const bestCabinet = this.findBestCabinet(replacements, cabinets);
            if (bestCabinet) {
                advice.push(`💡 ${bestCabinet.name} est votre cabinet le plus rentable avec une moyenne de ${formatCurrency(bestCabinet.avgDailyRate)}/jour.`);
            }
        }

        // 5. Prévision fin de mois
        advice.push(`📊 Prévision de revenus pour ce mois-ci: ${formatCurrency(stats.monthlyProjected)} basé sur le rythme actuel.`);

        return advice;
    },

    async calculateStats(replacements) {
        const now = new Date();
        const monthlyReplacements = replacements.filter(r => new Date(r.date).getMonth() === now.getMonth() && r.status !== 'Annulé');
        const monthlyRevenue = monthlyReplacements.reduce((sum, r) => sum + (r.payment_received || 0), 0);
        const projected = monthlyReplacements.reduce((sum, r) => sum + (r.expected_payment || 0), 0);
        return { monthlyRevenue, monthlyProjected: projected };
    },

    detectConflicts(replacements) {
        const conflicts = [];
        const sorted = [...replacements].filter(r => r.status !== 'Annulé').sort((a,b) => new Date(a.date) - new Date(b.date));
        
        for (let i = 0; i < sorted.length - 1; i++) {
            const currentEnd = new Date(`${sorted[i].date}T${sorted[i].end_time}`);
            const nextStart = new Date(`${sorted[i+1].date}T${sorted[i+1].start_time}`);
            
            if (sorted[i].date === sorted[i+1].date && currentEnd > nextStart) {
                conflicts.push(`⚠️ Conflit horaire le ${sorted[i].date} entre deux remplacements.`);
            }
        }
        return conflicts;
    },

    detectLongDays(replacements) {
        const advice = [];
        const byDay = {};
        
        replacements.filter(r => r.status !== 'Annulé').forEach(r => {
            if(!byDay[r.date]) byDay[r.date] = { start: '23:59', end: '00:00' };
            if(r.start_time < byDay[r.date].start) byDay[r.date].start = r.start_time;
            if(r.end_time > byDay[r.date].end) byDay[r.date].end = r.end_time;
        });

        Object.keys(byDay).forEach(date => {
            const start = new Date(`${date}T${byDay[date].start}`);
            const end = new Date(`${date}T${byDay[date].end}`);
            const hours = (end - start) / (1000 * 60 * 60);
            if (hours > 10) {
                advice.push(`😴 Journée longue détectée le ${date} (${hours.toFixed(1)}h). Pensez à reposer.`);
            }
        });
        return advice;
    },

    detectForgottenPayments(replacements) {
        const now = new Date();
        const forgotten = [];
        replacements.forEach(r => {
            if (r.status === 'Facturé' && r.date) {
                const rDate = new Date(r.date);
                const diffDays = (now - rDate) / (1000 * 60 * 60 * 24);
                if (diffDays > 30) {
                    forgotten.push(`💰 Paiement en attente depuis ${diffDays.toFixed(0)} jours (Facture de ${formatCurrency(r.expected_payment || 0)}).`);
                }
            }
        });
        return forgotten;
    },

    findBestCabinet(replacements, cabinets) {
        const cabinetStats = {};
        replacements.forEach(r => {
            if(!cabinetStats[r.cabinet_id]) cabinetStats[r.cabinet_id] = { total: 0, count: 0 };
            cabinetStats[r.cabinet_id].total += r.expected_payment || 0;
            cabinetStats[r.cabinet_id].count++;
        });

        let bestId = null;
        let bestAvg = 0;
        Object.keys(cabinetStats).forEach(id => {
            const avg = cabinetStats[id].total / cabinetStats[id].count;
            if (avg > bestAvg) {
                bestAvg = avg;
                bestId = id;
            }
        });

        return cabinets.find(c => c.id === bestId) ? { ...cabinets.find(c => c.id === bestId), avgDailyRate: bestAvg } : null;
    },

    /**
     * Commande vocale / Texte naturel
     * Ex: "Ajoute un remplacement mardi matin au cabinet Martin"
     */
    processNaturalLanguage(input, cabinets) {
        const text = input.toLowerCase();
        const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        
        let targetDate = new Date();
        let foundDay = false;
        
        days.forEach((day, index) => {
            if (text.includes(day)) {
                const today = targetDate.getDay();
                let diff = (index - today + 7) % 7;
                if (diff === 0 && text.includes('prochain')) diff = 7;
                targetDate.setDate(targetDate.getDate() + diff);
                foundDay = true;
            }
        });

        const isMorning = text.includes('matin');
        const isAfternoon = text.includes('apres-midi') || text.includes('après-midi') || text.includes('aprem');

        let startTime = '08:00';
        let endTime = '12:00';
        if (isAfternoon) {
            startTime = '13:00';
            endTime = '17:00';
        }

        let targetCabinet = null;
        cabinets.forEach(c => {
            if (text.includes(c.name.toLowerCase())) targetCabinet = c;
        });

        if (foundDay && targetCabinet) {
            return {
                date: targetDate.toISOString().split('T')[0],
                start_time: startTime,
                end_time: endTime,
                cabinet_id: targetCabinet.id,
                status: 'En attente'
            };
        }
        return null;
    }
};

export default AI;
