import { createContext, useContext } from 'react';

// ── Direction ───────────────────────────────────────────────────────────────

export type Direction = 'ltr' | 'rtl';

// ── Locale strings ──────────────────────────────────────────────────────────

export interface LocaleStrings {
  // Common
  close: string;
  cancel: string;
  confirm: string;
  save: string;
  delete: string;
  search: string;
  loading: string;
  noResults: string;
  required: string;

  // Pagination
  previous: string;
  next: string;
  pageOf: (page: number, total: number) => string;

  // Select
  selectPlaceholder: string;
  clearSelection: string;

  // DatePicker
  selectDate: string;
  today: string;

  // FileUpload
  dropFiles: string;
  browse: string;

  // Table
  noData: string;
  sortAscending: string;
  sortDescending: string;
}

// ── Default English locale ──────────────────────────────────────────────────

export const enUS: LocaleStrings = {
  close: 'Close',
  cancel: 'Cancel',
  confirm: 'Confirm',
  save: 'Save',
  delete: 'Delete',
  search: 'Search',
  loading: 'Loading...',
  noResults: 'No results found',
  required: 'Required',
  previous: 'Previous',
  next: 'Next',
  pageOf: (page, total) => `Page ${page} of ${total}`,
  selectPlaceholder: 'Select...',
  clearSelection: 'Clear selection',
  selectDate: 'Select a date',
  today: 'Today',
  dropFiles: 'Drop files here or',
  browse: 'Browse',
  noData: 'No data available',
  sortAscending: 'Sort ascending',
  sortDescending: 'Sort descending',
};

// ── Additional locales ──────────────────────────────────────────────────────

export const esES: LocaleStrings = {
  close: 'Cerrar',
  cancel: 'Cancelar',
  confirm: 'Confirmar',
  save: 'Guardar',
  delete: 'Eliminar',
  search: 'Buscar',
  loading: 'Cargando...',
  noResults: 'No se encontraron resultados',
  required: 'Requerido',
  previous: 'Anterior',
  next: 'Siguiente',
  pageOf: (page, total) => `Página ${page} de ${total}`,
  selectPlaceholder: 'Seleccionar...',
  clearSelection: 'Limpiar selección',
  selectDate: 'Seleccionar fecha',
  today: 'Hoy',
  dropFiles: 'Suelte archivos aquí o',
  browse: 'Explorar',
  noData: 'No hay datos disponibles',
  sortAscending: 'Orden ascendente',
  sortDescending: 'Orden descendente',
};

export const arSA: LocaleStrings = {
  close: 'إغلاق',
  cancel: 'إلغاء',
  confirm: 'تأكيد',
  save: 'حفظ',
  delete: 'حذف',
  search: 'بحث',
  loading: '...جارٍ التحميل',
  noResults: 'لم يتم العثور على نتائج',
  required: 'مطلوب',
  previous: 'السابق',
  next: 'التالي',
  pageOf: (page, total) => `صفحة ${page} من ${total}`,
  selectPlaceholder: '...اختر',
  clearSelection: 'مسح الاختيار',
  selectDate: 'اختر تاريخ',
  today: 'اليوم',
  dropFiles: 'أفلت الملفات هنا أو',
  browse: 'تصفح',
  noData: 'لا توجد بيانات',
  sortAscending: 'ترتيب تصاعدي',
  sortDescending: 'ترتيب تنازلي',
};

export const frFR: LocaleStrings = {
  close: 'Fermer',
  cancel: 'Annuler',
  confirm: 'Confirmer',
  save: 'Enregistrer',
  delete: 'Supprimer',
  search: 'Rechercher',
  loading: 'Chargement...',
  noResults: 'Aucun résultat trouvé',
  required: 'Obligatoire',
  previous: 'Précédent',
  next: 'Suivant',
  pageOf: (page, total) => `Page ${page} sur ${total}`,
  selectPlaceholder: 'Sélectionner...',
  clearSelection: 'Effacer la sélection',
  selectDate: 'Sélectionner une date',
  today: "Aujourd'hui",
  dropFiles: 'Déposez les fichiers ici ou',
  browse: 'Parcourir',
  noData: 'Aucune donnée disponible',
  sortAscending: 'Tri croissant',
  sortDescending: 'Tri décroissant',
};

export const deDE: LocaleStrings = {
  close: 'Schließen',
  cancel: 'Abbrechen',
  confirm: 'Bestätigen',
  save: 'Speichern',
  delete: 'Löschen',
  search: 'Suchen',
  loading: 'Wird geladen...',
  noResults: 'Keine Ergebnisse gefunden',
  required: 'Erforderlich',
  previous: 'Zurück',
  next: 'Weiter',
  pageOf: (page, total) => `Seite ${page} von ${total}`,
  selectPlaceholder: 'Auswählen...',
  clearSelection: 'Auswahl löschen',
  selectDate: 'Datum auswählen',
  today: 'Heute',
  dropFiles: 'Dateien hier ablegen oder',
  browse: 'Durchsuchen',
  noData: 'Keine Daten verfügbar',
  sortAscending: 'Aufsteigend sortieren',
  sortDescending: 'Absteigend sortieren',
};

export const jaJP: LocaleStrings = {
  close: '閉じる',
  cancel: 'キャンセル',
  confirm: '確認',
  save: '保存',
  delete: '削除',
  search: '検索',
  loading: '読み込み中...',
  noResults: '結果が見つかりません',
  required: '必須',
  previous: '前へ',
  next: '次へ',
  pageOf: (page, total) => `${total}ページ中${page}ページ`,
  selectPlaceholder: '選択...',
  clearSelection: '選択解除',
  selectDate: '日付を選択',
  today: '今日',
  dropFiles: 'ファイルをドロップまたは',
  browse: '参照',
  noData: 'データなし',
  sortAscending: '昇順',
  sortDescending: '降順',
};

// ── Locale map ──────────────────────────────────────────────────────────────

export const LOCALES = {
  'en-US': enUS,
  'es-ES': esES,
  'ar-SA': arSA,
  'fr-FR': frFR,
  'de-DE': deDE,
  'ja-JP': jaJP,
} as const;

export type LocaleCode = keyof typeof LOCALES;

// ── RTL languages ───────────────────────────────────────────────────────────

const RTL_LOCALES = new Set<string>(['ar-SA', 'he-IL', 'fa-IR', 'ur-PK']);

export function isRTL(locale: string): boolean {
  return RTL_LOCALES.has(locale);
}

// ── Context ─────────────────────────────────────────────────────────────────

export interface I18nContextValue {
  locale: LocaleCode;
  direction: Direction;
  strings: LocaleStrings;
}

export const I18nContext = createContext<I18nContextValue>({
  locale: 'en-US',
  direction: 'ltr',
  strings: enUS,
});

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}

export function useLocale(): LocaleStrings {
  return useContext(I18nContext).strings;
}

export function useDirection(): Direction {
  return useContext(I18nContext).direction;
}
