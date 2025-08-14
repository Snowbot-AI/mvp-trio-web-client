// Type issu du contrat d'interface fourni

/**
 * Enum des services Trio
 */
export enum TrioService {
  /**
   * ACC for 'Accueil'.
   */
  ACC = "ACC",

  /**
   * ADM for 'Admin'.
   */
  ADM = "ADM",

  /**
   * BAT for 'Bâtiment'.
   */
  BAT = "BAT",

  /**
   * BIL for 'Billetterie'.
   */
  BIL = "BIL",

  /**
   * COM for 'Communication commerciale'.
   */
  COM = "COM",

  /**
   * DAM for 'Dammage'.
   */
  DAM = "DAM",

  /**
   * PAR for 'Parc de roulage'.
   */
  PAR = "PAR",

  /**
   * PIS for 'Pistes'.
   */
  PIS = "PIS",

  /**
   * REST for 'Restaurant'.
   */
  REST = "REST",

  /**
   * RM for 'Remontée mécanique'.
   */
  RM = "RM",

  /**
   * USI for 'Snowmaker' (Usine à neige).
   */
  USI = "USI",
}

/**
 * Enum des codes de station Trio
 */
export enum CodeStation {
  /**
   * 00 for 'Siège'.
   */
  CODE_00 = "00",

  /**
   * 06 for 'Cambre'.
   */
  CODE_06 = "06",

  /**
   * 07 for 'Porté-Puymorens'.
   */
  CODE_07 = "07",

  /**
   * 08 for 'Formiguères'.
   */
  CODE_08 = "08",

  /**
   * 999 for 'Restauration' - to be determined
   */
  CODE_999 = "999"
}

/**
 * Convertit un code de station en nom de station
 * @param codeStation - Le code de la station (ex: "00", "06", etc.)
 * @returns Le nom de la station correspondant
 */
export function getStationName(codeStation: CodeStation): string {
  switch (codeStation) {
    case CodeStation.CODE_00:
      return "Siège"
    case CodeStation.CODE_06:
      return "Cambre d'Az"
    case CodeStation.CODE_07:
      return "Porté-Puymorens"
    case CodeStation.CODE_08:
      return "Formiguères"
    case CodeStation.CODE_999:
      return "Restauration"
    default:
      return "Station inconnue"
  }
}

/**
 * Enum des statuts de demande d'achat
 */
export enum PurchaseRequestStatus {
  /** The request is in a draft state. No validation has been applied yet. */
  BROUILLON = "BROUILLON",

  /** The request has been submitted and is pending review by the director. */
  A_VERIFIER = "A_VERIFIER",

  /** The request was reviewed and returned for modification by the director. The station manager must revise it. */
  A_MODIFIER = "A_MODIFIER",

  /** The request has been approved and validated. */
  VALIDEE = "VALIDEE",

  /** The request has been rejected following a review. */
  REJETEE = "REJETEE",
}

export enum ItemType {
  GI = "gi",
  GER = "ger",
  INVEST = "invest",
  FUNCT = "funct"
}

export type StatusDemande = PurchaseRequestStatus 