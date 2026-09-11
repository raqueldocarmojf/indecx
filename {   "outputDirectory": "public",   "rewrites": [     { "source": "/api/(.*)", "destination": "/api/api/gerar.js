export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Metodo nao permitido" });

  const { url, conteudo, persona, canal, objetivo, contexto } = req.body;

  if (!persona) return res.status(400).json({ error: "Persona e obrigatoria." });
  if (!url && !conteudo) return res.status(400).json({ error: "Informe o link do site ou cole o conteudo manualmente." });

  let conteudoFinal = conteudo || "";

  if (url && url.startsWith("http")) {
    try {
      const siteRes = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; bot/1.0)" },
        signal: AbortSignal.timeout(8000)
      });
      const html = await siteRes.text();
      const semTags = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim()
        .slice(0, 6000);
      conteudoFinal = semTags + (conteudo ? "\n\nContexto adicional do SDR:\n" + conteudo : "");
    } catch (e) {
      if (!conteudo) return res.status(400).json({ error: "Nao foi possivel acessar o site. Cole o conteudo manualmente." });
    }
  }

  const CATALOGO = `
1. Plataforma INDECX XM: plataforma SaaS completa de monitoramento de CX com NPS, CSAT, CES, Health Score e Five Star Rating. Coleta omnichannel, dashboards em tempo real, mais de 60 tipos de relatorio. Ideal para empresas que querem centralizar toda a gestao de experiencia do cliente em um unico lugar.
2. IA para Analise de Sentimentos e Categorizacao: IA proprietaria que categoriza comentarios, analisa sentimentos, interpreta causas raiz e gera analises SWOT automatizadas. Ideal para empresas com alto volume de respostas abertas que precisam transformar texto em insight acionavel.
3. Gestao de Detratores e Closed Loop Feedback: fluxos automaticos de follow-up, escalacao e resolucao para detratores e clientes insatisfeitos. Ideal para times de CS que precisam agir rapido sobre feedback negativo antes que vire churn.
4. INDECX BPO: a INDECX assume processos de fechamento de loop, tratativa de reclamacoes, contatos ativos, atualizacao de relatorios e desenvolvimento de BI. Ideal para empresas sem time interno dedicado a CX.
5. Inteligencia de Mercado e Pesquisa: analise comportamental de fidelidade, satisfacao e experiencia via pesquisas multicanal e multimetodologia. Ideal para benchmarking e entendimento de mercado.
6. Integracoes e API: integracao nativa com Salesforce, HubSpot, Zendesk e outros CRMs e ferramentas de BI. Ideal para empresas com stack tecnologico estruturado que querem visao 360 do cliente.
7. Consultoria em CX: estruturacao ou maturidade da area de Customer Experience. Metodologia, processos, metricas e cultura centrada no cliente. Ideal para empresas iniciando a jornada de CX ou que coletam dados mas nao transformam em acao estrategica.`;

  const CASES = `
- Roda Rico (fintech de investimentos): adotou a INDECX como ferramenta de experiencia do cliente. Segmento: fintech.
- Setor imobiliario: uso intenso para entender clientes na jornada de compra e pos-venda. Resultado: melhoria continua nos processos baseada em dados reais de satisfacao.
- Varejo: avaliacao de fidelidade e satisfacao em multiplos pontos da jornada. Resultado: tomada de decisao mais rapida com relatorios em tempo real.
- Reconhecimento internacional: premiada no AI World Series e Customer Centricity World Series 2025 em Dubai, entre mais de 300 cases de 30 paises.`;

  const prompt = `Voce e um especialista em prospeccao B2B outbound do time comercial da INDECX, plataforma lider em Customer Experience no Brasil, premiada internacionalmente. Voce escreve mensagens diretas, personalizadas e consultivas, nunca genericas.

PORTFOLIO:
${CATALOGO}

CASES E REFERENCIAS:
${CASES}

CONTEXTO DA ABORDAGEM:
- Conteudo do prospect: ${conteudoFinal}
- Persona alvo (cargo e contexto): ${persona}
- Canal: ${canal}
- Objetivo: ${objetivo}
${contexto ? `- Contexto adicional: ${contexto}` : ""}

FRAMEWORK RAIZ - siga essa estrutura rigorosamente:
R (Relevancia Real): abra com uma observacao especifica e verificavel sobre o prospect, crescimento de base, expansao de time de CS, segmento com alta pressao de churn, vagas abertas em CX ou CS. NUNCA elogio generico.
A (Abertura Contextual): conecte com uma dor de mercado conhecida. Ex: empresas em expansao de base costumam perder NPS sem perceber ate que o churn ja esta instalado. Ou times de CS sem dados estruturados apagam incendio sem saber a causa raiz.
I (Insight): traga dado concreto ou referencia da INDECX. Ex: clientes que estruturaram o closed loop de detratores reduziram churn involuntario em ate 30%. Ou a IA da INDECX categoriza milhares de comentarios em segundos, eliminando semanas de trabalho manual.
Z (Zona de Convite): feche com pergunta leve e de baixo compromisso. Ex: Como voces acompanham hoje a satisfacao dos clientes? ou Faz sentido trocarmos uma ideia em 15 min? NUNCA vamos marcar uma reuniao.

REGRAS DE TOM E ESTILO:
- Use o primeiro nome da persona no inicio e ao longo da mensagem
- Direto e objetivo, sem rodeios
- Tom consultivo, nao de vendedor
- Adapte ao cargo: Head de CS fala em churn e health score. CMO fala em NPS e percepcao de marca. CEO fala em retencao e crescimento. Diretor de Operacoes fala em processo e escala
- LinkedIn: curto, direto, paragrafos de 1 a 2 linhas
- Email: mais longo, contextual, feche com Abracos e nome do SDR
- WhatsApp: muito curto, informal, uma pergunta no final
- Ligacao: roteiro com abertura, contexto e pergunta de diagnostico

Identifique qual solucao tem maior fit e gere a abordagem seguindo rigorosamente o RAIZ.

Responda SOMENTE em JSON valido:
{"produto_indicado":"nome exato de uma das 7 solucoes","fit_score":85,"justificativa_fit":"2-3 frases sobre o fit usando dados reais do prospect","sinais_de_compra":["sinal 1","sinal 2","sinal 3"],"abordagem":"mensagem completa seguindo o RAIZ no tom e formato do canal","dicas_de_follow_up":["dica 1","dica 2"]}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 1200,
        messages: [
          { role: "system", content: "Especialista em prospeccao B2B de CX e Customer Success. Responda sempre em JSON valido." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: err?.error?.message || "Erro na API" });
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: e.message || "Erro interno" });
  }
}
