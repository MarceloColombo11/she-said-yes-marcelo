import sobreNosData from "@/data/sobre-nos.json";
import venueData from "@/data/venue.json";

export type FieldKind =
  | "text"
  | "textarea"
  | "paragraphs"
  | "datetime"
  | "url"
  | "media";

export type FieldDef = {
  name: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  max?: number;
  hint?: string;
};

export type BlockValue = Record<string, string | string[] | null>;

export type BlockDef = {
  label: string;
  description: string;
  fields: FieldDef[];
  defaults: BlockValue;
};

export type SobreNosBlock = {
  titulo: string;
  subtitulo: string;
  paragrafos: string[];
  assinatura: string;
};

export type SecoesBlock = {
  padrinhosTitulo: string;
  padrinhosSubtitulo: string;
  honraTitulo: string;
  honraSubtitulo: string;
  damasTitulo: string;
  damasSubtitulo: string;
  localTitulo: string;
  localSubtitulo: string;
  programacaoTitulo: string;
  programacaoSubtitulo: string;
  presentesTitulo: string;
  presentesSubtitulo: string;
  fotosTitulo: string;
  fotosSubtitulo: string;
};

export type RsvpBlock = {
  titulo: string;
  texto: string;
  botao: string;
  modalTitulo: string;
  modalDescricao: string;
  sucessoTitulo: string;
  sucessoDescricao: string;
  sucessoMensagem: string;
  microonibusAviso: string;
};

export type ConfirmacaoBlock = {
  titulo: string;
  subtitulo: string;
  prazo: string;
  vouDica: string;
  naoVouDica: string;
  sucessoVouTitulo: string;
  sucessoVouTexto: string;
  sucessoNaoVouTitulo: string;
  sucessoNaoVouTexto: string;
};

export type ConviteBlock = {
  titulo: string;
  subtitulo: string;
  mensagemDia: string;
  atalhosTitulo: string;
};

export type RodapeBlock = {
  iniciais: string;
  assinatura: string;
};

export type CompartilhamentoBlock = {
  nomeSite: string;
  titulo: string;
  descricao: string;
};

export type EventoBlock = {
  inicio: string;
  fim: string;
  tituloAgenda: string;
  descricaoAgenda: string;
  localNome: string;
  endereco: string;
  telefone: string;
  mapsUrl: string;
  mapaEmbedUrl: string;
  instagramUrl: string;
  instagramHandle: string;
  instagramPosts: string[];
  localDescricao: string[];
  logoMediaId: string | null;
};

export type TextBlockValues = {
  sobre_nos: SobreNosBlock;
  secoes: SecoesBlock;
  rsvp: RsvpBlock;
  confirmacao: ConfirmacaoBlock;
  convite: ConviteBlock;
  rodape: RodapeBlock;
  compartilhamento: CompartilhamentoBlock;
  evento: EventoBlock;
};

export type TextBlockKey = keyof TextBlockValues;

const t = (
  name: string,
  label: string,
  extra: Partial<FieldDef> = {},
): FieldDef => ({ name, label, kind: "text", required: true, max: 200, ...extra });

export const TEXT_BLOCKS: Record<TextBlockKey, BlockDef> = {
  sobre_nos: {
    label: "Sobre Nós",
    description: "Título, subtítulo, parágrafos e assinatura da história do casal.",
    fields: [
      t("titulo", "Título"),
      t("subtitulo", "Subtítulo"),
      {
        name: "paragrafos",
        label: "Parágrafos",
        kind: "paragraphs",
        required: true,
        hint: "Parágrafos que começam com aspas viram citação em itálico.",
      },
      t("assinatura", "Assinatura"),
    ],
    defaults: {
      titulo: sobreNosData.titulo,
      subtitulo: sobreNosData.subtitulo,
      paragrafos: sobreNosData.paragrafos,
      assinatura: sobreNosData.assinatura,
    },
  },
  secoes: {
    label: "Títulos das seções",
    description: "Títulos e subtítulos que aparecem no topo de cada seção do site.",
    fields: [
      t("padrinhosTitulo", "Padrinhos — título"),
      t("padrinhosSubtitulo", "Padrinhos — subtítulo"),
      t("honraTitulo", "Convidados de Honra — título"),
      t("honraSubtitulo", "Convidados de Honra — subtítulo"),
      t("damasTitulo", "Damas de Honra — título"),
      t("damasSubtitulo", "Damas de Honra — subtítulo"),
      t("localTitulo", "Local — título"),
      t("localSubtitulo", "Local — subtítulo"),
      t("programacaoTitulo", "Programação — título"),
      t("programacaoSubtitulo", "Programação — subtítulo", { max: 300 }),
      t("presentesTitulo", "Presentes — título"),
      t("presentesSubtitulo", "Presentes — subtítulo", { max: 300 }),
      t("fotosTitulo", "Fotos — título"),
      t("fotosSubtitulo", "Fotos — subtítulo", { max: 300 }),
    ],
    defaults: {
      padrinhosTitulo: "Padrinhos",
      padrinhosSubtitulo: "As pessoas que caminham conosco",
      honraTitulo: "Convidados de Honra",
      honraSubtitulo: "Especiais para nós",
      damasTitulo: "Damas de Honra",
      damasSubtitulo: "Nossas queridas damas",
      localTitulo: "Local",
      localSubtitulo: "Onde celebraremos nosso amor",
      programacaoTitulo: "Programação",
      programacaoSubtitulo:
        "Toque em cada momento para ver os detalhes — Recepção às 16h, cerimônia às 16h30",
      presentesTitulo: "Presentes",
      presentesSubtitulo: "Se preferir nos presentear, aqui estão algumas sugestões.",
      fotosTitulo: "Suba suas fotos e vídeos",
      fotosSubtitulo:
        "Compartilhe seus momentos conosco! Envie várias fotos ou vídeos de uma vez.",
    },
  },
  rsvp: {
    label: "Confirmação de presença (site)",
    description: "Textos da seção de confirmação na página inicial e do formulário.",
    fields: [
      t("titulo", "Título da seção"),
      t("texto", "Texto da seção", { kind: "textarea", max: 600 }),
      t("botao", "Texto do botão"),
      t("modalTitulo", "Título do formulário"),
      t("modalDescricao", "Descrição do formulário", { max: 300 }),
      t("microonibusAviso", "Aviso do microônibus", { max: 300 }),
      t("sucessoTitulo", "Título após confirmar"),
      t("sucessoDescricao", "Descrição após confirmar", { max: 300 }),
      t("sucessoMensagem", "Mensagem após confirmar", { max: 300 }),
    ],
    defaults: {
      titulo: "Confirmação de Presença",
      texto:
        "Seria uma honra contar com sua presença neste dia tão especial. Por favor, confirme sua presença até o dia 15 de novembro de 2026.",
      botao: "Confirmar Presença",
      modalTitulo: "Confirmar Presença",
      modalDescricao:
        "Preencha o formulário para confirmar sua presença no nosso casamento.",
      microonibusAviso: "O microônibus será por conta dos noivos.",
      sucessoTitulo: "Resposta recebida!",
      sucessoDescricao:
        "Obrigado por nos responder! Sua resposta é muito importante para nós.",
      sucessoMensagem: "Mal podemos esperar para celebrar com você!",
    },
  },
  confirmacao: {
    label: "Página de confirmação (/confirmacao)",
    description: "Textos da página dedicada de confirmação de presença.",
    fields: [
      t("titulo", "Título"),
      t("subtitulo", "Subtítulo", { max: 300 }),
      t("prazo", "Linha do prazo"),
      t("vouDica", "Dica ao escolher “Eu vou”"),
      t("naoVouDica", "Dica ao escolher “Não vou”"),
      t("sucessoVouTitulo", "Título quando confirma"),
      t("sucessoVouTexto", "Texto quando confirma", { max: 300 }),
      t("sucessoNaoVouTitulo", "Título quando não vai"),
      t("sucessoNaoVouTexto", "Texto quando não vai", { max: 300 }),
    ],
    defaults: {
      titulo: "Confirma presença",
      subtitulo: "A gente tá contando os dias — e a festa fica mais bonita com você.",
      prazo: "Até 15 de novembro de 2026",
      vouDica: "Que alegria. Te esperamos de coração aberto.",
      naoVouDica: "Tudo bem. Obrigado por avisar com carinho.",
      sucessoVouTitulo: "Que alegria. Você vem!",
      sucessoVouTexto: "Nos vemos na festa. Vai ser ainda mais especial com você.",
      sucessoNaoVouTitulo: "Recebido com carinho.",
      sucessoNaoVouTexto: "Vai fazer falta, mas a gente entende. Obrigado por avisar.",
    },
  },
  convite: {
    label: "Página do dia (/convite)",
    description:
      "Textos da página com as informações do dia, enviada aos convidados na semana do casamento.",
    fields: [
      t("titulo", "Título"),
      t("subtitulo", "Subtítulo", { max: 300 }),
      t("mensagemDia", "Mensagem no dia do casamento", { max: 300 }),
      t("atalhosTitulo", "Título dos atalhos"),
    ],
    defaults: {
      titulo: "Tá chegando!",
      subtitulo: "Tudo o que você precisa pra chegar e curtir o dia com a gente.",
      mensagemDia: "É hoje! Te esperamos de coração aberto.",
      atalhosTitulo: "Durante a festa",
    },
  },
  rodape: {
    label: "Rodapé",
    description: "Iniciais e frase do rodapé do site.",
    fields: [t("iniciais", "Iniciais", { max: 20 }), t("assinatura", "Frase")],
    defaults: {
      iniciais: "S & M",
      assinatura: "Suelen & Marcelo — Com amor, para sempre",
    },
  },
  compartilhamento: {
    label: "Compartilhamento (WhatsApp e redes)",
    description:
      "Título e descrição que aparecem quando o link do site é compartilhado.",
    fields: [
      t("nomeSite", "Nome do site"),
      t("titulo", "Título"),
      t("descricao", "Descrição", { max: 300 }),
    ],
    defaults: {
      nomeSite: "Suelen & Marcelo",
      titulo: "Suelen & Marcelo — 28.11.2026",
      descricao:
        "Celebremos juntos o amor de Suelen e Marcelo. 28 de novembro de 2026.",
    },
  },
  evento: {
    label: "Evento e local",
    description:
      "Data, horário e endereço do casamento. Usados no contador, na agenda, no compartilhamento e na seção Local.",
    fields: [
      {
        name: "inicio",
        label: "Início (horário de Brasília)",
        kind: "datetime",
        required: true,
      },
      {
        name: "fim",
        label: "Término (horário de Brasília)",
        kind: "datetime",
        required: true,
      },
      t("tituloAgenda", "Título na agenda"),
      t("descricaoAgenda", "Descrição na agenda", { kind: "textarea", max: 500 }),
      t("localNome", "Nome do local"),
      t("endereco", "Endereço", { max: 300 }),
      t("telefone", "Telefone do local", { required: false, max: 40 }),
      {
        name: "localDescricao",
        label: "Descrição do local",
        kind: "paragraphs",
        required: true,
      },
      {
        name: "mapsUrl",
        label: "Link do Google Maps",
        kind: "url",
        required: true,
        max: 1000,
        hint: "Link que abre o endereço no Maps (botão “Abrir no Maps”).",
      },
      {
        name: "mapaEmbedUrl",
        label: "Mapa incorporado (URL do embed)",
        kind: "url",
        required: false,
        max: 2000,
        hint: "No Google Maps: Compartilhar → Incorporar um mapa → copie só o endereço que está em src=\"…\".",
      },
      {
        name: "logoMediaId",
        label: "Logo do local",
        kind: "media",
        required: false,
      },
      {
        name: "instagramUrl",
        label: "Instagram do local (link)",
        kind: "url",
        required: false,
        max: 300,
      },
      t("instagramHandle", "Instagram do local (@ sem o @)", {
        required: false,
        max: 80,
      }),
      {
        name: "instagramPosts",
        label: "Publicações do Instagram",
        kind: "paragraphs",
        required: false,
        max: 300,
        hint: "Um link de publicação por campo (ex.: https://www.instagram.com/p/…).",
      },
    ],
    defaults: {
      inicio: "2026-11-28T16:30",
      fim: "2026-11-28T23:00",
      tituloAgenda: "Casamento Suelen & Marcelo",
      descricaoAgenda: "Cerimônia e celebração de Suelen e Marcelo no Mirante Garden.",
      localNome: venueData.nome,
      endereco: venueData.endereco,
      telefone: venueData.telefone,
      localDescricao: venueData.descricao,
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Mirante+Garden+Fazendinha+Biguacu+SC",
      mapaEmbedUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3540.400967922347!2d-48.700594124541496!3d-27.45677367632704!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9527530be692af6f%3A0x7a1b1042588b0df!2sMirante%20Garden!5e0!3m2!1sen!2sbr!4v1774201165659!5m2!1sen!2sbr",
      logoMediaId: null,
      instagramUrl: venueData.instagram,
      instagramHandle: venueData.instagramHandle,
      instagramPosts: [
        "https://www.instagram.com/p/DV9nJsJjyuz/",
        "https://www.instagram.com/p/DUnyY8aDmBc/",
      ],
    },
  },
};

export const TEXT_BLOCK_KEYS = Object.keys(TEXT_BLOCKS) as TextBlockKey[];

export function isTextBlockKey(value: string): value is TextBlockKey {
  return value in TEXT_BLOCKS;
}

function readField(field: FieldDef, raw: unknown, fallback: unknown) {
  if (field.kind === "paragraphs") {
    if (Array.isArray(raw)) {
      const items = raw
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
      if (items.length > 0 || !field.required) return items;
    }
    return Array.isArray(fallback) ? fallback : [];
  }
  if (field.kind === "media") {
    return typeof raw === "string" && raw ? raw : null;
  }
  if (typeof raw === "string" && (raw.trim() || !field.required)) {
    return raw;
  }
  return typeof fallback === "string" ? fallback : "";
}

/** Combina o payload salvo com os valores padrão, campo a campo. */
export function readTextBlock<K extends TextBlockKey>(
  key: K,
  payload: unknown,
): TextBlockValues[K] {
  const def = TEXT_BLOCKS[key];
  const record =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : null;
  const out: BlockValue = {};
  for (const field of def.fields) {
    out[field.name] = record
      ? (readField(field, record[field.name], def.defaults[field.name]) as
          | string
          | string[]
          | null)
      : def.defaults[field.name];
  }
  return out as unknown as TextBlockValues[K];
}

export function defaultTextBlock<K extends TextBlockKey>(
  key: K,
): TextBlockValues[K] {
  return readTextBlock(key, null);
}
