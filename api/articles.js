import fetch from 'node-fetch';
import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

const SOURCES = [
  // 🚨 Alertes
  { url: 'https://ansm.sante.fr/rss/actualites',                          source: 'ANSM',                  folder: 'Alertes',      country: '🇫🇷' },
  { url: 'https://ansm.sante.fr/rss/decisions',                           source: 'ANSM Décisions',        folder: 'Médicaments',  country: '🇫🇷' },
  { url: 'https://www.who.int/feeds/entity/csr/don/en/rss.xml',           source: 'OMS Alertes',           folder: 'Alertes',      country: '🌍' },
  { url: 'https://www.santepubliquefrance.fr/rss',                        source: 'Santé Publique France', folder: 'Alertes',      country: '🇫🇷' },
  { url: 'https://www.ema.europa.eu/en/safety-rss',                       source: 'EMA Sécurité',          folder: 'Alertes',      country: '🇪🇺' },
  // 🇫🇷 France Institutionnel
  { url: 'https://www.has-sante.fr/jcms/fc_1249599/fr/flux-rss',         source: 'HAS',                   folder: 'France',       country: '🇫🇷' },
  { url: 'https://sante.gouv.fr/rss/actualites.xml',                      source: 'Ministère Santé',       folder: 'France',       country: '🇫🇷' },
  { url: 'https://presse.inserm.fr/feed/',                                 source: 'INSERM',                folder: 'Recherche',    country: '🇫🇷' },
  { url: 'https://www.pasteur.fr/fr/rss/toutes-les-actualites',           source: 'Institut Pasteur',      folder: 'Recherche',    country: '🇫🇷' },
  { url: 'https://www.ameli.fr/rss',                                       source: 'Assurance Maladie',     folder: 'France',       country: '🇫🇷' },
  // 🇪🇺 Europe
  { url: 'https://www.ema.europa.eu/en/news/rss',                         source: 'EMA',                   folder: 'Médicaments',  country: '🇪🇺' },
  // 🌍 International
  { url: 'https://www.who.int/feeds/entity/fr/en/rss.xml',                source: 'OMS',                   folder: 'International',country: '🌍' },
  { url: 'https://www.rts.ch/rss/sante.xml',                              source: 'RTS Santé',             folder: 'International',country: '🇨🇭' },
  { url: 'https://www.rtbf.be/rss/info/sante',                            source: 'RTBF Santé',            folder: 'International',country: '🇧🇪' },
  { url: 'https://tools.cdc.gov/api/v2/resources/media/316422.rss',       source: 'CDC',                   folder: 'International',country: '🌍' },
  // 🔬 Recherche
  { url: 'https://www.thelancet.com/rssfeed/lancet_online.xml',           source: 'The Lancet',            folder: 'Recherche',    country: '🌍' },
  { url: 'https://www.bmj.com/rss/current.xml',                           source: 'BMJ',                   folder: 'Recherche',    country: '🌍' },
  { url: 'https://www.nature.com/nm.rss',                                  source: 'Nature Medicine',       folder: 'Recherche',    country: '🌍' },
  // 🗞️ Presse médicale professionnelle
  { url: 'https://www.lequotidiendumedecin.fr/feed',                      source: 'Quotidien du Médecin',  folder: 'Presse',       country: '🇫🇷' },
  { url: 'https://www.vidal.fr/rss/actualites.xml',                       source: 'Vidal',                 folder: 'Médicaments',  country: '🇫🇷' },
  { url: 'https://www.jim.fr/rss.xml',                                     source: 'Jim.fr',                folder: 'Presse',       country: '🇫🇷' },
  { url: 'https://www.actusoins.com/feed',                                 source: 'Actusoins',             folder: 'Presse',       country: '🇫🇷' },
  { url: 'https://www.ticsante.com/rss.xml',                              source: 'TICsanté',              folder: 'Recherche',    country: '🇫🇷' },
  { url: 'https://www.reseau-sentinelles.org/rss',                        source: 'Réseau Sentinelles',    folder: 'Alertes',      country: '🇫🇷' },
  // 🗞️ Presse grand public santé
  { url: 'https://www.20minutes.fr/feeds/rss-sante.xml',                  source: '20 Minutes Santé',      folder: 'Presse',       country: '🇫🇷' },
  { url: 'https://www.allodocteurs.fr/rss',                               source: 'Allo Docteurs',         folder: 'Presse',       country: '🇫🇷' },
  { url: 'https://www.destinationsante.com/feed',                         source: 'Destination Santé',     folder: 'Presse',       country: '🇫🇷' },
  { url: 'https://www.francetvinfo.fr/sante.rss',                         source: 'Franceinfo Santé',      folder: 'Presse',       country: '🇫🇷' },
  { url: 'https://www.topsante.com/rss/rss.xml',                          source: 'Top Santé',             folder: 'Presse',       country: '🇫🇷' },
  { url: 'https://www.journaldemontreal.com/rss/sante.xml',               source: 'Journal de Montréal',   folder: 'International',country: '🇨🇦' },
  { url: 'https://www.medisite.fr/rss/actualites',                        source: 'Medisite',              folder: 'Presse',       country: '🇫🇷' },
  { url: 'https://www.santemagazine.fr/rss.xml',                          source: 'Santé Magazine',        folder: 'Presse',       country: '🇫🇷' },
  { url: 'https://www.sante-nutrition.org/feed/',                         source: 'Santé Nutrition',       folder: 'Presse',       country: '🇫🇷' },
  { url: 'https://www.santeplusmag.com/feed/',                            source: 'Santé+ Magazine',       folder: 'Presse',       country: '🇫🇷' },
  { url: 'https://www.lepoint.fr/sante/rss.xml',                          source: 'Le Point Santé',        folder: 'Presse',       country: '🇫🇷' },
];

function detectCategory(text) {
  const t = text.toLowerCase();
  if (/épidémie|outbreak|alerte|grippe|covid|dengue|rougeole|mpox|contamination/.test(t)) return 'Épidémies';
  if (/médicament|amm|autorisation|pharmacovigil|molécule|biosimilaire|vaccin|retrait|rappel/.test(t)) return 'Médicaments';
  if (/politique|remboursement|sécu|assurance maladie|réforme|plan|budget|loi|financement/.test(t)) return 'Politiques';
  if (/recherche|étude|essai|phase|découverte|innovation|intelligence artificielle|thérapie/.test(t)) return 'Recherche';
  return 'Santé publique';
}

function isUrgent(title) {
  return /alerte|urgent|rappel|suspension|retrait|interdiction|contamination|épidémie|pandémie|risque|signal/i.test(title);
}

function parseItems(parsed) {
  const channel = parsed?.rss?.channel || parsed?.feed;
  if (!channel) return [];
  const items = channel.item || channel.entry || [];
  return (Array.isArray(items) ? items : [items]).map(item => {
    const title   = item.title?.['#text'] || item.title || '';
    const link    = item.link?.['@_href'] || item.link || item.guid || '';
    const date    = item.pubDate || item.updated || item.published || '';
    const summary = item.description?.['#text'] || item.description ||
                    item.summary?.['#text']  || item.summary  ||
                    item.content?.['#text']  || '';
    return { title, link, date, summary };
  });
}

async function fetchFeed(source) {
  try {
    const res = await fetch(source.url, {
      headers: { 'User-Agent': 'VeilSante/1.0 RSS Reader' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const xml    = await res.text();
    const parsed = parser.parse(xml);
    const items  = parseItems(parsed);

    return items.slice(0, 10).map((item, i) => ({
      id:       `${source.source}-${i}`,
      title:    item.title.replace(/<[^>]+>/g, '').trim(),
      source:   source.source,
      country:  source.country,
      folder:   source.folder,
      url:      typeof item.link === 'string' ? item.link : '',
      date:     item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      summary:  item.summary.replace(/<[^>]+>/g, '').slice(0, 300).trim() + '…',
      category: detectCategory(item.title + ' ' + item.summary),
      urgent:   isUrgent(item.title),
    }));
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=900');

  const { folder, category } = req.query;

  const sources = folder
    ? SOURCES.filter(s => s.folder.toLowerCase() === folder.toLowerCase())
    : SOURCES;

  const results = await Promise.allSettled(sources.map(fetchFeed));
  let articles = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value);

  if (category && category !== 'Tous') {
    articles = articles.filter(a => a.category === category);
  }

  articles.sort((a, b) => new Date(b.date) - new Date(a.date));

  res.status(200).json({
    articles,
    total: articles.length,
    sources: sources.length,
    updatedAt: new Date().toISOString(),
  });
}
