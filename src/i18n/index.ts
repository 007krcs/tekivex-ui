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

  // Table / DataGrid
  noData: string;
  sortAscending: string;
  sortDescending: string;
  filterPlaceholder: string;
  exportCsv: string;
  rowsSelected: (n: number) => string;

  // Pagination — optional, English fallback used at the call site if missing.
  // (Optional so adding these does not break the 35 existing locale literals.)
  firstPage?: string;
  lastPage?: string;
  previousPage?: string;
  nextPage?: string;
  showingRange?: (start: number, end: number, total: number) => string;
  itemsPerPage?: string;

  // FileUpload extras
  uploadFiles?: string;
  acceptedFormats?: (formats: string) => string;
  maxFileSize?: (size: string) => string;

  // DatePicker extras
  clearDate?: string;
  previousMonth?: string;
  nextMonth?: string;
  yesterday?: string;
  last7Days?: string;
  last30Days?: string;
  thisMonth?: string;
  lastMonth?: string;

  // Toast / notifications
  notifications?: string;

  // Command palette
  commandSearch?: string;
  noCommandsFound?: string;

  // Drawer
  closeDrawer?: string;
}

// ── Helper — build a locale without having to re-type every key ─────────────

function locale(strings: LocaleStrings): LocaleStrings {
  return strings;
}

// ── Locales ─────────────────────────────────────────────────────────────────

// English (United States)
export const enUS = locale({
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
  filterPlaceholder: 'Filter...',
  exportCsv: 'Export CSV',
  rowsSelected: (n) => `${n} row${n === 1 ? '' : 's'} selected`,
});

// Spanish (Spain)
export const esES = locale({
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
  filterPlaceholder: 'Filtrar...',
  exportCsv: 'Exportar CSV',
  rowsSelected: (n) => `${n} fila${n === 1 ? '' : 's'} seleccionada${n === 1 ? '' : 's'}`,
});

// Portuguese (Brazil)
export const ptBR = locale({
  close: 'Fechar',
  cancel: 'Cancelar',
  confirm: 'Confirmar',
  save: 'Salvar',
  delete: 'Excluir',
  search: 'Pesquisar',
  loading: 'Carregando...',
  noResults: 'Nenhum resultado encontrado',
  required: 'Obrigatório',
  previous: 'Anterior',
  next: 'Próximo',
  pageOf: (page, total) => `Página ${page} de ${total}`,
  selectPlaceholder: 'Selecionar...',
  clearSelection: 'Limpar seleção',
  selectDate: 'Selecionar data',
  today: 'Hoje',
  dropFiles: 'Solte arquivos aqui ou',
  browse: 'Procurar',
  noData: 'Nenhum dado disponível',
  sortAscending: 'Ordenar crescente',
  sortDescending: 'Ordenar decrescente',
  filterPlaceholder: 'Filtrar...',
  exportCsv: 'Exportar CSV',
  rowsSelected: (n) => `${n} linha${n === 1 ? '' : 's'} selecionada${n === 1 ? '' : 's'}`,
});

// Portuguese (Portugal)
export const ptPT = locale({
  close: 'Fechar',
  cancel: 'Cancelar',
  confirm: 'Confirmar',
  save: 'Guardar',
  delete: 'Eliminar',
  search: 'Pesquisar',
  loading: 'A carregar...',
  noResults: 'Sem resultados',
  required: 'Obrigatório',
  previous: 'Anterior',
  next: 'Próximo',
  pageOf: (page, total) => `Página ${page} de ${total}`,
  selectPlaceholder: 'Selecionar...',
  clearSelection: 'Limpar seleção',
  selectDate: 'Selecionar data',
  today: 'Hoje',
  dropFiles: 'Largue ficheiros aqui ou',
  browse: 'Procurar',
  noData: 'Sem dados disponíveis',
  sortAscending: 'Ordenar crescente',
  sortDescending: 'Ordenar decrescente',
  filterPlaceholder: 'Filtrar...',
  exportCsv: 'Exportar CSV',
  rowsSelected: (n) => `${n} linha${n === 1 ? '' : 's'} selecionada${n === 1 ? '' : 's'}`,
});

// French (France)
export const frFR = locale({
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
  filterPlaceholder: 'Filtrer...',
  exportCsv: 'Exporter CSV',
  rowsSelected: (n) => `${n} ligne${n === 1 ? '' : 's'} sélectionnée${n === 1 ? '' : 's'}`,
});

// German (Germany)
export const deDE = locale({
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
  filterPlaceholder: 'Filtern...',
  exportCsv: 'CSV exportieren',
  rowsSelected: (n) => `${n} Zeile${n === 1 ? '' : 'n'} ausgewählt`,
});

// Italian (Italy)
export const itIT = locale({
  close: 'Chiudi',
  cancel: 'Annulla',
  confirm: 'Conferma',
  save: 'Salva',
  delete: 'Elimina',
  search: 'Cerca',
  loading: 'Caricamento...',
  noResults: 'Nessun risultato trovato',
  required: 'Obbligatorio',
  previous: 'Precedente',
  next: 'Successivo',
  pageOf: (page, total) => `Pagina ${page} di ${total}`,
  selectPlaceholder: 'Seleziona...',
  clearSelection: 'Cancella selezione',
  selectDate: 'Seleziona una data',
  today: 'Oggi',
  dropFiles: 'Trascina file qui o',
  browse: 'Sfoglia',
  noData: 'Nessun dato disponibile',
  sortAscending: 'Ordinamento crescente',
  sortDescending: 'Ordinamento decrescente',
  filterPlaceholder: 'Filtra...',
  exportCsv: 'Esporta CSV',
  rowsSelected: (n) => `${n} riga${n === 1 ? '' : 'i'} selezionat${n === 1 ? 'a' : 'e'}`,
});

// Dutch (Netherlands)
export const nlNL = locale({
  close: 'Sluiten',
  cancel: 'Annuleren',
  confirm: 'Bevestigen',
  save: 'Opslaan',
  delete: 'Verwijderen',
  search: 'Zoeken',
  loading: 'Laden...',
  noResults: 'Geen resultaten gevonden',
  required: 'Verplicht',
  previous: 'Vorige',
  next: 'Volgende',
  pageOf: (page, total) => `Pagina ${page} van ${total}`,
  selectPlaceholder: 'Selecteer...',
  clearSelection: 'Selectie wissen',
  selectDate: 'Selecteer een datum',
  today: 'Vandaag',
  dropFiles: 'Zet bestanden hier neer of',
  browse: 'Bladeren',
  noData: 'Geen gegevens beschikbaar',
  sortAscending: 'Oplopend sorteren',
  sortDescending: 'Aflopend sorteren',
  filterPlaceholder: 'Filteren...',
  exportCsv: 'CSV exporteren',
  rowsSelected: (n) => `${n} rij${n === 1 ? '' : 'en'} geselecteerd`,
});

// Polish (Poland)
export const plPL = locale({
  close: 'Zamknij',
  cancel: 'Anuluj',
  confirm: 'Potwierdź',
  save: 'Zapisz',
  delete: 'Usuń',
  search: 'Szukaj',
  loading: 'Ładowanie...',
  noResults: 'Nie znaleziono wyników',
  required: 'Wymagane',
  previous: 'Poprzednia',
  next: 'Następna',
  pageOf: (page, total) => `Strona ${page} z ${total}`,
  selectPlaceholder: 'Wybierz...',
  clearSelection: 'Wyczyść wybór',
  selectDate: 'Wybierz datę',
  today: 'Dzisiaj',
  dropFiles: 'Upuść pliki tutaj lub',
  browse: 'Przeglądaj',
  noData: 'Brak danych',
  sortAscending: 'Sortuj rosnąco',
  sortDescending: 'Sortuj malejąco',
  filterPlaceholder: 'Filtruj...',
  exportCsv: 'Eksportuj CSV',
  rowsSelected: (n) => `Wybrano ${n} wier${n === 1 ? 'sz' : 'sze'}`,
});

// Russian (Russia)
export const ruRU = locale({
  close: 'Закрыть',
  cancel: 'Отмена',
  confirm: 'Подтвердить',
  save: 'Сохранить',
  delete: 'Удалить',
  search: 'Поиск',
  loading: 'Загрузка...',
  noResults: 'Результаты не найдены',
  required: 'Обязательно',
  previous: 'Назад',
  next: 'Вперёд',
  pageOf: (page, total) => `Страница ${page} из ${total}`,
  selectPlaceholder: 'Выбрать...',
  clearSelection: 'Снять выделение',
  selectDate: 'Выбрать дату',
  today: 'Сегодня',
  dropFiles: 'Перетащите файлы сюда или',
  browse: 'Обзор',
  noData: 'Нет данных',
  sortAscending: 'По возрастанию',
  sortDescending: 'По убыванию',
  filterPlaceholder: 'Фильтр...',
  exportCsv: 'Экспорт CSV',
  rowsSelected: (n) => `Выбрано ${n} строк`,
});

// Ukrainian (Ukraine)
export const ukUA = locale({
  close: 'Закрити',
  cancel: 'Скасувати',
  confirm: 'Підтвердити',
  save: 'Зберегти',
  delete: 'Видалити',
  search: 'Пошук',
  loading: 'Завантаження...',
  noResults: 'Результати не знайдено',
  required: "Обов'язково",
  previous: 'Назад',
  next: 'Далі',
  pageOf: (page, total) => `Сторінка ${page} з ${total}`,
  selectPlaceholder: 'Вибрати...',
  clearSelection: 'Очистити вибір',
  selectDate: 'Вибрати дату',
  today: 'Сьогодні',
  dropFiles: 'Перетягніть файли або',
  browse: 'Огляд',
  noData: 'Немає даних',
  sortAscending: 'За зростанням',
  sortDescending: 'За спаданням',
  filterPlaceholder: 'Фільтр...',
  exportCsv: 'Експорт CSV',
  rowsSelected: (n) => `Вибрано ${n} рядків`,
});

// Turkish (Turkey)
export const trTR = locale({
  close: 'Kapat',
  cancel: 'İptal',
  confirm: 'Onayla',
  save: 'Kaydet',
  delete: 'Sil',
  search: 'Ara',
  loading: 'Yükleniyor...',
  noResults: 'Sonuç bulunamadı',
  required: 'Zorunlu',
  previous: 'Önceki',
  next: 'Sonraki',
  pageOf: (page, total) => `${total} sayfadan ${page}. sayfa`,
  selectPlaceholder: 'Seçin...',
  clearSelection: 'Seçimi temizle',
  selectDate: 'Tarih seçin',
  today: 'Bugün',
  dropFiles: 'Dosyaları buraya bırakın veya',
  browse: 'Gözat',
  noData: 'Veri yok',
  sortAscending: 'Artan sıralama',
  sortDescending: 'Azalan sıralama',
  filterPlaceholder: 'Filtrele...',
  exportCsv: 'CSV dışa aktar',
  rowsSelected: (n) => `${n} satır seçildi`,
});

// Swedish (Sweden)
export const svSE = locale({
  close: 'Stäng',
  cancel: 'Avbryt',
  confirm: 'Bekräfta',
  save: 'Spara',
  delete: 'Ta bort',
  search: 'Sök',
  loading: 'Laddar...',
  noResults: 'Inga resultat hittades',
  required: 'Obligatoriskt',
  previous: 'Föregående',
  next: 'Nästa',
  pageOf: (page, total) => `Sida ${page} av ${total}`,
  selectPlaceholder: 'Välj...',
  clearSelection: 'Rensa val',
  selectDate: 'Välj ett datum',
  today: 'Idag',
  dropFiles: 'Släpp filer här eller',
  browse: 'Bläddra',
  noData: 'Inga data tillgängliga',
  sortAscending: 'Sortera stigande',
  sortDescending: 'Sortera fallande',
  filterPlaceholder: 'Filtrera...',
  exportCsv: 'Exportera CSV',
  rowsSelected: (n) => `${n} rad${n === 1 ? '' : 'er'} vald${n === 1 ? '' : 'a'}`,
});

// Danish (Denmark)
export const daDK = locale({
  close: 'Luk',
  cancel: 'Annuller',
  confirm: 'Bekræft',
  save: 'Gem',
  delete: 'Slet',
  search: 'Søg',
  loading: 'Indlæser...',
  noResults: 'Ingen resultater fundet',
  required: 'Påkrævet',
  previous: 'Forrige',
  next: 'Næste',
  pageOf: (page, total) => `Side ${page} af ${total}`,
  selectPlaceholder: 'Vælg...',
  clearSelection: 'Ryd valg',
  selectDate: 'Vælg en dato',
  today: 'I dag',
  dropFiles: 'Slip filer her eller',
  browse: 'Gennemse',
  noData: 'Ingen data tilgængelige',
  sortAscending: 'Sorter stigende',
  sortDescending: 'Sorter faldende',
  filterPlaceholder: 'Filtrer...',
  exportCsv: 'Eksporter CSV',
  rowsSelected: (n) => `${n} række${n === 1 ? '' : 'r'} valgt`,
});

// Czech (Czech Republic)
export const csCZ = locale({
  close: 'Zavřít',
  cancel: 'Zrušit',
  confirm: 'Potvrdit',
  save: 'Uložit',
  delete: 'Smazat',
  search: 'Hledat',
  loading: 'Načítání...',
  noResults: 'Žádné výsledky',
  required: 'Povinné',
  previous: 'Předchozí',
  next: 'Další',
  pageOf: (page, total) => `Stránka ${page} z ${total}`,
  selectPlaceholder: 'Vyberte...',
  clearSelection: 'Vymazat výběr',
  selectDate: 'Vyberte datum',
  today: 'Dnes',
  dropFiles: 'Přetáhněte soubory nebo',
  browse: 'Procházet',
  noData: 'Žádná data',
  sortAscending: 'Seřadit vzestupně',
  sortDescending: 'Seřadit sestupně',
  filterPlaceholder: 'Filtrovat...',
  exportCsv: 'Exportovat CSV',
  rowsSelected: (n) => `Vybráno ${n} řádků`,
});

// Hungarian (Hungary)
export const huHU = locale({
  close: 'Bezárás',
  cancel: 'Mégse',
  confirm: 'Megerősítés',
  save: 'Mentés',
  delete: 'Törlés',
  search: 'Keresés',
  loading: 'Betöltés...',
  noResults: 'Nincs találat',
  required: 'Kötelező',
  previous: 'Előző',
  next: 'Következő',
  pageOf: (page, total) => `${page}. oldal / ${total}`,
  selectPlaceholder: 'Válasszon...',
  clearSelection: 'Kijelölés törlése',
  selectDate: 'Válasszon dátumot',
  today: 'Ma',
  dropFiles: 'Húzza ide a fájlokat vagy',
  browse: 'Tallózás',
  noData: 'Nincs adat',
  sortAscending: 'Növekvő sorrend',
  sortDescending: 'Csökkenő sorrend',
  filterPlaceholder: 'Szűrés...',
  exportCsv: 'CSV exportálása',
  rowsSelected: (n) => `${n} sor kiválasztva`,
});

// Arabic (Saudi Arabia) — RTL
export const arSA = locale({
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
  filterPlaceholder: '...فلترة',
  exportCsv: 'تصدير CSV',
  rowsSelected: (n) => `تم تحديد ${n} صفوف`,
});

// Hebrew (Israel) — RTL
export const heIL = locale({
  close: 'סגור',
  cancel: 'ביטול',
  confirm: 'אישור',
  save: 'שמור',
  delete: 'מחק',
  search: 'חיפוש',
  loading: 'טוען...',
  noResults: 'לא נמצאו תוצאות',
  required: 'חובה',
  previous: 'הקודם',
  next: 'הבא',
  pageOf: (page, total) => `עמוד ${page} מתוך ${total}`,
  selectPlaceholder: 'בחר...',
  clearSelection: 'נקה בחירה',
  selectDate: 'בחר תאריך',
  today: 'היום',
  dropFiles: 'גרור קבצים לכאן או',
  browse: 'עיון',
  noData: 'אין נתונים',
  sortAscending: 'מיון עולה',
  sortDescending: 'מיון יורד',
  filterPlaceholder: 'סינון...',
  exportCsv: 'ייצוא CSV',
  rowsSelected: (n) => `נבחרו ${n} שורות`,
});

// Persian / Farsi (Iran) — RTL
export const faIR = locale({
  close: 'بستن',
  cancel: 'لغو',
  confirm: 'تأیید',
  save: 'ذخیره',
  delete: 'حذف',
  search: 'جستجو',
  loading: '...در حال بارگذاری',
  noResults: 'نتیجه‌ای یافت نشد',
  required: 'الزامی',
  previous: 'قبلی',
  next: 'بعدی',
  pageOf: (page, total) => `صفحه ${page} از ${total}`,
  selectPlaceholder: '...انتخاب کنید',
  clearSelection: 'پاک کردن انتخاب',
  selectDate: 'تاریخ را انتخاب کنید',
  today: 'امروز',
  dropFiles: 'فایل‌ها را اینجا رها کنید یا',
  browse: 'مرور',
  noData: 'داده‌ای موجود نیست',
  sortAscending: 'مرتب‌سازی صعودی',
  sortDescending: 'مرتب‌سازی نزولی',
  filterPlaceholder: '...فیلتر',
  exportCsv: 'خروجی CSV',
  rowsSelected: (n) => `${n} ردیف انتخاب شده`,
});

// Japanese (Japan)
export const jaJP = locale({
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
  filterPlaceholder: 'フィルター...',
  exportCsv: 'CSVエクスポート',
  rowsSelected: (n) => `${n}行選択中`,
});

// Korean (South Korea)
export const koKR = locale({
  close: '닫기',
  cancel: '취소',
  confirm: '확인',
  save: '저장',
  delete: '삭제',
  search: '검색',
  loading: '로딩 중...',
  noResults: '검색 결과 없음',
  required: '필수',
  previous: '이전',
  next: '다음',
  pageOf: (page, total) => `${total}페이지 중 ${page}페이지`,
  selectPlaceholder: '선택...',
  clearSelection: '선택 해제',
  selectDate: '날짜 선택',
  today: '오늘',
  dropFiles: '여기에 파일을 놓거나',
  browse: '찾아보기',
  noData: '데이터 없음',
  sortAscending: '오름차순 정렬',
  sortDescending: '내림차순 정렬',
  filterPlaceholder: '필터...',
  exportCsv: 'CSV 내보내기',
  rowsSelected: (n) => `${n}개 행 선택됨`,
});

// Chinese Simplified (China)
export const zhCN = locale({
  close: '关闭',
  cancel: '取消',
  confirm: '确认',
  save: '保存',
  delete: '删除',
  search: '搜索',
  loading: '加载中...',
  noResults: '未找到结果',
  required: '必填',
  previous: '上一页',
  next: '下一页',
  pageOf: (page, total) => `第 ${page} 页，共 ${total} 页`,
  selectPlaceholder: '请选择...',
  clearSelection: '清除选择',
  selectDate: '选择日期',
  today: '今天',
  dropFiles: '将文件拖到此处或',
  browse: '浏览',
  noData: '暂无数据',
  sortAscending: '升序排列',
  sortDescending: '降序排列',
  filterPlaceholder: '筛选...',
  exportCsv: '导出 CSV',
  rowsSelected: (n) => `已选择 ${n} 行`,
});

// Chinese Traditional (Taiwan)
export const zhTW = locale({
  close: '關閉',
  cancel: '取消',
  confirm: '確認',
  save: '儲存',
  delete: '刪除',
  search: '搜尋',
  loading: '載入中...',
  noResults: '未找到結果',
  required: '必填',
  previous: '上一頁',
  next: '下一頁',
  pageOf: (page, total) => `第 ${page} 頁，共 ${total} 頁`,
  selectPlaceholder: '請選擇...',
  clearSelection: '清除選擇',
  selectDate: '選擇日期',
  today: '今天',
  dropFiles: '將檔案拖曳至此或',
  browse: '瀏覽',
  noData: '暫無資料',
  sortAscending: '升冪排列',
  sortDescending: '降冪排列',
  filterPlaceholder: '篩選...',
  exportCsv: '匯出 CSV',
  rowsSelected: (n) => `已選擇 ${n} 行`,
});

// Thai (Thailand)
export const thTH = locale({
  close: 'ปิด',
  cancel: 'ยกเลิก',
  confirm: 'ยืนยัน',
  save: 'บันทึก',
  delete: 'ลบ',
  search: 'ค้นหา',
  loading: 'กำลังโหลด...',
  noResults: 'ไม่พบผลลัพธ์',
  required: 'จำเป็น',
  previous: 'ก่อนหน้า',
  next: 'ถัดไป',
  pageOf: (page, total) => `หน้า ${page} จาก ${total}`,
  selectPlaceholder: 'เลือก...',
  clearSelection: 'ล้างการเลือก',
  selectDate: 'เลือกวันที่',
  today: 'วันนี้',
  dropFiles: 'วางไฟล์ที่นี่หรือ',
  browse: 'เรียกดู',
  noData: 'ไม่มีข้อมูล',
  sortAscending: 'เรียงจากน้อยไปมาก',
  sortDescending: 'เรียงจากมากไปน้อย',
  filterPlaceholder: 'กรอง...',
  exportCsv: 'ส่งออก CSV',
  rowsSelected: (n) => `เลือก ${n} แถว`,
});

// Vietnamese (Vietnam)
export const viVN = locale({
  close: 'Đóng',
  cancel: 'Hủy',
  confirm: 'Xác nhận',
  save: 'Lưu',
  delete: 'Xóa',
  search: 'Tìm kiếm',
  loading: 'Đang tải...',
  noResults: 'Không tìm thấy kết quả',
  required: 'Bắt buộc',
  previous: 'Trước',
  next: 'Tiếp',
  pageOf: (page, total) => `Trang ${page} / ${total}`,
  selectPlaceholder: 'Chọn...',
  clearSelection: 'Xóa lựa chọn',
  selectDate: 'Chọn ngày',
  today: 'Hôm nay',
  dropFiles: 'Thả tệp vào đây hoặc',
  browse: 'Duyệt',
  noData: 'Không có dữ liệu',
  sortAscending: 'Sắp xếp tăng dần',
  sortDescending: 'Sắp xếp giảm dần',
  filterPlaceholder: 'Lọc...',
  exportCsv: 'Xuất CSV',
  rowsSelected: (n) => `Đã chọn ${n} hàng`,
});

// Indonesian (Indonesia)
export const idID = locale({
  close: 'Tutup',
  cancel: 'Batal',
  confirm: 'Konfirmasi',
  save: 'Simpan',
  delete: 'Hapus',
  search: 'Cari',
  loading: 'Memuat...',
  noResults: 'Tidak ada hasil',
  required: 'Wajib',
  previous: 'Sebelumnya',
  next: 'Berikutnya',
  pageOf: (page, total) => `Halaman ${page} dari ${total}`,
  selectPlaceholder: 'Pilih...',
  clearSelection: 'Hapus pilihan',
  selectDate: 'Pilih tanggal',
  today: 'Hari ini',
  dropFiles: 'Seret file ke sini atau',
  browse: 'Jelajahi',
  noData: 'Tidak ada data',
  sortAscending: 'Urutkan naik',
  sortDescending: 'Urutkan turun',
  filterPlaceholder: 'Filter...',
  exportCsv: 'Ekspor CSV',
  rowsSelected: (n) => `${n} baris dipilih`,
});

// Romanian (Romania)
export const roRO = locale({
  close: 'Închide',
  cancel: 'Anulează',
  confirm: 'Confirmă',
  save: 'Salvează',
  delete: 'Șterge',
  search: 'Caută',
  loading: 'Se încarcă...',
  noResults: 'Nu s-au găsit rezultate',
  required: 'Obligatoriu',
  previous: 'Anterior',
  next: 'Următor',
  pageOf: (page, total) => `Pagina ${page} din ${total}`,
  selectPlaceholder: 'Selectați...',
  clearSelection: 'Șterge selecția',
  selectDate: 'Selectați o dată',
  today: 'Astăzi',
  dropFiles: 'Trageți fișierele aici sau',
  browse: 'Răsfoiți',
  noData: 'Nu există date',
  sortAscending: 'Sortare crescătoare',
  sortDescending: 'Sortare descrescătoare',
  filterPlaceholder: 'Filtrați...',
  exportCsv: 'Exportați CSV',
  rowsSelected: (n) => `${n} rând${n === 1 ? '' : 'uri'} selectat${n === 1 ? '' : 'e'}`,
});

// ── South Asian locales (v2.7) ─────────────────────────────────────────────
// Added together because they share a target audience and similar patterns.
// Plural rules: Hindi-Urdu uses simple n!==1 (same as English). Bengali, Tamil,
// Telugu, Gujarati, Marathi follow the same structure.

// Hindi (India)
export const hiIN = locale({
  close: 'बंद करें',
  cancel: 'रद्द करें',
  confirm: 'पुष्टि करें',
  save: 'सहेजें',
  delete: 'हटाएँ',
  search: 'खोजें',
  loading: 'लोड हो रहा है...',
  noResults: 'कोई परिणाम नहीं मिला',
  required: 'आवश्यक',
  previous: 'पिछला',
  next: 'अगला',
  pageOf: (page, total) => `पृष्ठ ${page} / ${total}`,
  selectPlaceholder: 'चुनें...',
  clearSelection: 'चयन साफ़ करें',
  selectDate: 'दिनांक चुनें',
  today: 'आज',
  dropFiles: 'यहाँ फ़ाइलें छोड़ें या',
  browse: 'ब्राउज़ करें',
  noData: 'कोई डेटा उपलब्ध नहीं',
  sortAscending: 'आरोही क्रम में',
  sortDescending: 'अवरोही क्रम में',
  filterPlaceholder: 'फ़िल्टर...',
  exportCsv: 'CSV निर्यात करें',
  rowsSelected: (n) => `${n} पंक्ति${n === 1 ? '' : 'याँ'} चयनित`,
});

// Marathi (India)
export const mrIN = locale({
  close: 'बंद करा',
  cancel: 'रद्द करा',
  confirm: 'पुष्टी करा',
  save: 'जतन करा',
  delete: 'हटवा',
  search: 'शोधा',
  loading: 'लोड होत आहे...',
  noResults: 'कोणतेही परिणाम सापडले नाहीत',
  required: 'आवश्यक',
  previous: 'मागील',
  next: 'पुढील',
  pageOf: (page, total) => `पृष्ठ ${page} / ${total}`,
  selectPlaceholder: 'निवडा...',
  clearSelection: 'निवड साफ करा',
  selectDate: 'तारीख निवडा',
  today: 'आज',
  dropFiles: 'फाइल्स येथे टाका किंवा',
  browse: 'ब्राउझ करा',
  noData: 'डेटा उपलब्ध नाही',
  sortAscending: 'चढत्या क्रमाने',
  sortDescending: 'उतरत्या क्रमाने',
  filterPlaceholder: 'फिल्टर...',
  exportCsv: 'CSV निर्यात करा',
  rowsSelected: (n) => `${n} पंक्ती निवडली${n === 1 ? '' : 'या'}`,
});

// Bengali (India / Bangladesh)
export const bnIN = locale({
  close: 'বন্ধ করুন',
  cancel: 'বাতিল',
  confirm: 'নিশ্চিত করুন',
  save: 'সংরক্ষণ',
  delete: 'মুছুন',
  search: 'খুঁজুন',
  loading: 'লোড হচ্ছে...',
  noResults: 'কোনো ফলাফল পাওয়া যায়নি',
  required: 'আবশ্যক',
  previous: 'পূর্ববর্তী',
  next: 'পরবর্তী',
  pageOf: (page, total) => `পৃষ্ঠা ${page} / ${total}`,
  selectPlaceholder: 'নির্বাচন করুন...',
  clearSelection: 'নির্বাচন মুছুন',
  selectDate: 'তারিখ নির্বাচন',
  today: 'আজ',
  dropFiles: 'এখানে ফাইল ছাড়ুন বা',
  browse: 'ব্রাউজ',
  noData: 'কোনো ডেটা নেই',
  sortAscending: 'ক্রমবর্ধমান',
  sortDescending: 'ক্রমহ্রাসমান',
  filterPlaceholder: 'ফিল্টার...',
  exportCsv: 'CSV রপ্তানি',
  rowsSelected: (n) => `${n}টি সারি নির্বাচিত`,
});

// Tamil (India / Sri Lanka / Singapore / Malaysia)
export const taIN = locale({
  close: 'மூடு',
  cancel: 'ரத்து',
  confirm: 'உறுதிப்படுத்து',
  save: 'சேமி',
  delete: 'நீக்கு',
  search: 'தேடு',
  loading: 'ஏற்றுகிறது...',
  noResults: 'முடிவுகள் இல்லை',
  required: 'தேவை',
  previous: 'முந்தைய',
  next: 'அடுத்து',
  pageOf: (page, total) => `பக்கம் ${page} / ${total}`,
  selectPlaceholder: 'தேர்ந்தெடு...',
  clearSelection: 'அழி',
  selectDate: 'தேதி தேர்ந்தெடு',
  today: 'இன்று',
  dropFiles: 'இங்கே கோப்புகளை விடவும் அல்லது',
  browse: 'உலாவு',
  noData: 'தரவு இல்லை',
  sortAscending: 'ஏறுவரிசை',
  sortDescending: 'இறங்குவரிசை',
  filterPlaceholder: 'வடிகட்டு...',
  exportCsv: 'CSV ஏற்றுமதி',
  rowsSelected: (n) => `${n} வரிசை${n === 1 ? '' : 'கள்'} தேர்ந்தெடுக்கப்பட்டது`,
});

// Telugu (India)
export const teIN = locale({
  close: 'మూసివేయి',
  cancel: 'రద్దు',
  confirm: 'నిర్ధారించు',
  save: 'సేవ్',
  delete: 'తొలగించు',
  search: 'వెతుకు',
  loading: 'లోడ్ అవుతోంది...',
  noResults: 'ఫలితాలు లేవు',
  required: 'అవసరం',
  previous: 'మునుపటి',
  next: 'తరువాత',
  pageOf: (page, total) => `పేజీ ${page} / ${total}`,
  selectPlaceholder: 'ఎంచుకోండి...',
  clearSelection: 'ఎంపిక క్లియర్',
  selectDate: 'తేదీ ఎంచుకోండి',
  today: 'నేడు',
  dropFiles: 'ఇక్కడ ఫైల్‌లను వదలండి లేదా',
  browse: 'బ్రౌజ్',
  noData: 'డేటా అందుబాటులో లేదు',
  sortAscending: 'ఆరోహణ',
  sortDescending: 'అవరోహణ',
  filterPlaceholder: 'ఫిల్టర్...',
  exportCsv: 'CSV ఎగుమతి',
  rowsSelected: (n) => `${n} అడ్డువరుస${n === 1 ? '' : 'లు'} ఎంచుకోబడ్డాయి`,
});

// Gujarati (India)
export const guIN = locale({
  close: 'બંધ',
  cancel: 'રદ',
  confirm: 'પુષ્ટિ',
  save: 'સાચવો',
  delete: 'કાઢી નાંખો',
  search: 'શોધો',
  loading: 'લોડ થઈ રહ્યું છે...',
  noResults: 'કોઈ પરિણામ મળ્યું નથી',
  required: 'આવશ્યક',
  previous: 'પાછલું',
  next: 'આગલું',
  pageOf: (page, total) => `પૃષ્ઠ ${page} / ${total}`,
  selectPlaceholder: 'પસંદ કરો...',
  clearSelection: 'પસંદગી સાફ',
  selectDate: 'તારીખ પસંદ કરો',
  today: 'આજે',
  dropFiles: 'અહીં ફાઇલો છોડો અથવા',
  browse: 'બ્રાઉઝ',
  noData: 'કોઈ ડેટા ઉપલબ્ધ નથી',
  sortAscending: 'ચઢતા ક્રમ',
  sortDescending: 'ઉતરતા ક્રમ',
  filterPlaceholder: 'ફિલ્ટર...',
  exportCsv: 'CSV નિકાસ',
  rowsSelected: (n) => `${n} પંક્તિ${n === 1 ? '' : 'ઓ'} પસંદ`,
});

// Punjabi / Gurmukhi (India)
export const paIN = locale({
  close: 'ਬੰਦ ਕਰੋ',
  cancel: 'ਰੱਦ ਕਰੋ',
  confirm: 'ਪੁਸ਼ਟੀ ਕਰੋ',
  save: 'ਸੰਭਾਲੋ',
  delete: 'ਮਿਟਾਓ',
  search: 'ਖੋਜੋ',
  loading: 'ਲੋਡ ਹੋ ਰਿਹਾ...',
  noResults: 'ਕੋਈ ਨਤੀਜਾ ਨਹੀਂ ਮਿਲਿਆ',
  required: 'ਲੋੜੀਂਦਾ',
  previous: 'ਪਿਛਲਾ',
  next: 'ਅਗਲਾ',
  pageOf: (page, total) => `ਪੰਨਾ ${page} / ${total}`,
  selectPlaceholder: 'ਚੁਣੋ...',
  clearSelection: 'ਚੋਣ ਸਾਫ਼',
  selectDate: 'ਮਿਤੀ ਚੁਣੋ',
  today: 'ਅੱਜ',
  dropFiles: 'ਇੱਥੇ ਫਾਈਲਾਂ ਛੱਡੋ ਜਾਂ',
  browse: 'ਬ੍ਰਾਊਜ਼',
  noData: 'ਕੋਈ ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ',
  sortAscending: 'ਚੜ੍ਹਦੇ ਕ੍ਰਮ',
  sortDescending: 'ਉਤਰਦੇ ਕ੍ਰਮ',
  filterPlaceholder: 'ਫਿਲਟਰ...',
  exportCsv: 'CSV ਨਿਰਯਾਤ',
  rowsSelected: (n) => `${n} ਕਤਾਰ${n === 1 ? '' : 'ਾਂ'} ਚੁਣੀਆਂ`,
});

// Urdu (Pakistan) — RTL. Uses Nastaliq when paired with Noto Nastaliq Urdu font.
export const urPK = locale({
  close: 'بند کریں',
  cancel: 'منسوخ',
  confirm: 'تصدیق',
  save: 'محفوظ کریں',
  delete: 'حذف کریں',
  search: 'تلاش',
  loading: 'لوڈ ہو رہا ہے...',
  noResults: 'کوئی نتیجہ نہیں ملا',
  required: 'ضروری',
  previous: 'پچھلا',
  next: 'اگلا',
  pageOf: (page, total) => `صفحہ ${page} / ${total}`,
  selectPlaceholder: 'منتخب کریں...',
  clearSelection: 'انتخاب صاف کریں',
  selectDate: 'تاریخ منتخب کریں',
  today: 'آج',
  dropFiles: 'یہاں فائلیں چھوڑیں یا',
  browse: 'براؤز',
  noData: 'کوئی ڈیٹا دستیاب نہیں',
  sortAscending: 'صعودی ترتیب',
  sortDescending: 'نزولی ترتیب',
  filterPlaceholder: 'فلٹر...',
  exportCsv: 'CSV برآمد',
  rowsSelected: (n) => `${n} قطار${n === 1 ? '' : 'یں'} منتخب`,
});

// ── Locale map ──────────────────────────────────────────────────────────────

export const LOCALES = {
  'en-US': enUS,
  'es-ES': esES,
  'pt-BR': ptBR,
  'pt-PT': ptPT,
  'fr-FR': frFR,
  'de-DE': deDE,
  'it-IT': itIT,
  'nl-NL': nlNL,
  'pl-PL': plPL,
  'ru-RU': ruRU,
  'uk-UA': ukUA,
  'tr-TR': trTR,
  'sv-SE': svSE,
  'da-DK': daDK,
  'cs-CZ': csCZ,
  'hu-HU': huHU,
  'ar-SA': arSA,
  'he-IL': heIL,
  'fa-IR': faIR,
  'ja-JP': jaJP,
  'ko-KR': koKR,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'th-TH': thTH,
  'vi-VN': viVN,
  'id-ID': idID,
  'ro-RO': roRO,
  // ── South Asian (v2.7) ───────────────────────────────────────────────────
  'hi-IN': hiIN,
  'mr-IN': mrIN,
  'bn-IN': bnIN,
  'ta-IN': taIN,
  'te-IN': teIN,
  'gu-IN': guIN,
  'pa-IN': paIN,
  'ur-PK': urPK,
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
