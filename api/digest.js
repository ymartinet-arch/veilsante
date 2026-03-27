import fetch from 'node-fetch';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).end();

  const { articles, period } = req.body;

  const articlesText = articles.slice(0, 12).map(a =>
    `- [${a.category}] ${a.title} (${a.source}, ${a.date})\n  ${a.summary}`
  ).join('\n');

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        system: `Tu es expert en santé publique francophone. Génère un digest email professionnel en français avec :
OBJET: [ligne objet percutante]

Bonjour,

[Introduction 2 phrases sur l'actu de la semaine]

🚨 ALERTES URGENTES
[liste des alertes si présentes]

📰 ACTUALITÉS PAR THÈME
[groupées par catégorie : Épidémies / Médicaments / Politiques / Recherche]

💡 POINT RECHERCHE DE LA SEMAINE
[1 découverte marquante]

Bonne semaine,
L'équipe VeilSanté`,
        messages: [{
          role: 'user',
          content: `Génère le digest santé pour ${period} à partir de ces articles :\n\n${articlesText}`
        }]
      })
    });

    const data = await r.json();
    res.status(200).json({ digest: data.content?.[0]?.text || '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
