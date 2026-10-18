# Lancio di myntas.com: dominio e parte legale

Documento interno (non pubblicato: sta fuori da `public/`). Aggiornato al 18 ottobre 2026.

---

## 1. Collegare myntas.com al sito (Cloudflare)

Il sito è il Worker **`myntas-website`** (indirizzo di test: `myntas-website.fragrant-waterfall-55f0.workers.dev`).
L'app Base44 non serve più: viene dismessa dopo la migrazione. I vecchi link `myntas.com/Account` portano già al modulo di accesso anticipato di AUREA (file `public/_redirects`).

### Passo 1. Portare il dominio su Cloudflare
Cloudflare deve gestire il DNS di myntas.com. Il dominio resta registrato dove l'hai comprato: si cambiano solo i "nameserver".

1. **Annota i record della posta.** Presso il registrar attuale (dove hai comprato myntas.com: Aruba, Register.it, GoDaddy, Namecheap, ecc.) apri la gestione DNS e fai uno screenshot di tutti i record, in particolare **MX** e **TXT** (SPF, DKIM, DMARC) e quelli usati da Google Workspace o Microsoft 365 per info@myntas.com.
2. **Aggiungi il sito su Cloudflare.** Dashboard → **Add a domain** (o "Add a site") → scrivi `myntas.com` → piano **Free** → Continua.
3. **Controlla i record importati.** Cloudflare legge i record esistenti. Confrontali con lo screenshot: devono esserci **tutti gli MX e i TXT**. Se ne manca qualcuno, aggiungilo a mano (DNS → Records → Add record). I record della posta devono avere la nuvola **grigia** ("DNS only").
4. **Elimina i record di Base44.** Cancella i record A, AAAA o CNAME per `myntas.com` (nome `@`) e per `www` che puntano a Base44. Lascia intatti MX e TXT.
5. **Disattiva DNSSEC presso il registrar** se è attivo (altrimenti il cambio di nameserver blocca il dominio). Lo riattiverai dopo da Cloudflare.
6. **Cambia i nameserver.** Cloudflare ti mostra due nameserver (del tipo `nome.ns.cloudflare.com`). Presso il registrar, nella sezione "Nameserver" o "DNS" del dominio, sostituisci quelli attuali con i due di Cloudflare e salva.
7. **Attendi l'attivazione.** Di solito da pochi minuti a qualche ora, al massimo 24-48 ore. Cloudflare ti manda un'email quando il dominio è **Active**.
8. **Verifica la posta**: manda un'email a info@myntas.com e controlla che arrivi.

### Passo 2. Collega il dominio al Worker
1. **Workers & Pages** → **myntas-website** → **Settings** → **Domains & Routes** → **Add** → **Custom domain**.
2. Scrivi `myntas.com` → **Add domain**. Cloudflare crea il record DNS e il certificato HTTPS da solo (qualche minuto).
3. Ripeti con `www.myntas.com`.
4. Consigliato: **Rules → Redirect Rules** → modello "Redirect from WWW to root", così `www.myntas.com` porta sempre a `myntas.com`.

### Passo 3. Verifica
- Apri `https://myntas.com`, `https://myntas.com/aurea/`, `https://myntas.com/en/`, `https://myntas.com/Account` (deve portare all'accesso anticipato) e una pagina inesistente (deve comparire la 404 di Myntas).
- Dimmelo: aggiungo il dominio anche in `wrangler.jsonc`, così ogni deploy automatico lo mantiene. Il blocco ai motori di ricerca resta finché non chiudiamo la sezione 5.

---

## 2. Cosa è già stato fatto sul sito

- **Informativa privacy** (`/privacy/`, `/en/privacy/`) e **cookie policy** (`/cookie/`, `/en/cookie/`) scritte sulla base di cosa fa davvero il sito. Sono pubblicate come "versione provvisoria, in fase di verifica legale".
- Il sito **non usa cookie** né memoria del browser e non fa richieste a servizi esterni (font, script e immagini sono ospitati sul sito): per questo non serve il banner dei cookie.
- Ogni modulo ha la casella di consenso con il link all'informativa nella lingua della pagina.
- I testi di marketing non promettono rendimenti, non citano il veicolo, gli immobili di esempio sono segnati "Esempio".

---

## 3. Da far verificare al legale

### 3.1 Informativa privacy: punti da confermare
1. **Basi giuridiche**: 6.1.b per richieste di tokenizzazione e contatti; consenso per accesso anticipato, avvisi e newsletter; legittimo interesse per sicurezza.
2. **Tempi di conservazione** proposti: 24 mesi dall'ultimo contatto per le richieste; fino a revoca per newsletter, avvisi e accesso anticipato.
3. **Responsabili del trattamento**: Cloudflare (hosting); fornitore email; strumento di gestione contatti (Notion, se confermato). Servono gli accordi DPA con ciascuno.
4. **Trasferimenti extra UE**: Data Privacy Framework o clausole contrattuali standard (Cloudflare, Notion).
5. **DPO**: non indicato. Confermare che non è obbligatorio.
6. **Consenso nei moduli**: il modulo proprietari usa una casella "acconsento a essere ricontattato", ma la base è precontrattuale. Valutare se trasformarla in presa visione dell'informativa.
7. Versione inglese: si è indicato che prevale quella italiana.

### 3.2 Cookie policy
Confermare che, senza cookie propri né analytics, è sufficiente l'informativa senza banner (Linee guida del Garante del 10 giugno 2021). Se in futuro si aggiunge un analytics, serve il banner prima di attivarlo.

### 3.3 Testi regolamentari da approvare

**Ovunque (footer di ogni pagina)**
- "Le informazioni su questo sito non costituiscono offerta di strumenti finanziari. Investire comporta rischi, inclusa la perdita del capitale investito." (EN equivalente)

**Home (`/`, `/en/`)**
- Hero: "Trasformiamo immobili a reddito in token digitali, acquistabili anche con piccole cifre." / "con ogni passaggio registrato sulla blockchain".
- Il processo: "Le quote vengono emesse come token e offerte tramite partner autorizzati."
- Perché tokenizzare, card Investitore: "Investi in immobili a reddito a partire da soli 100 €", "Ricevi la tua parte degli affitti", "Documenti d'offerta e reportistica sempre consultabili", "Più semplici da trasferire di un immobile intero".
- AUREA in tre passi: "Confermi con un clic", schermate di esempio.

**AUREA (`/aurea/`, `/en/aurea/`)**
- Hero: "Ogni immobile è diviso in token da 100 €: chi li possiede riceve la sua parte degli affitti, in proporzione."
- Il ciclo di un'offerta: Assegnazione ("se l'obiettivo non viene raggiunto, si applicano le regole indicate nel documento d'offerta"), Affitti ("al netto dei costi dell'immobile"), **Uscita** ("l'immobile viene venduto e il ricavato ripartito tra i titolari dei token").
- Primi passi: "verifica richiesta dalla normativa antiriciclaggio", "questionario per capire se l'investimento è adatto a te".
- FAQ: diritti del token, rivendita ("non è garantita"), costi, rischi, chi può investire, cosa succede alla fine.
- Nota finale: "descrivono il funzionamento previsto di AUREA e non costituiscono offerta di strumenti finanziari".

**Tokenize / Proprietari (`/proprietari/`, `/en/proprietari/`)**
- Vantaggi: "Un valore riconosciuto: il prezzo dei token parte da una perizia di stima", "Trasparenza: ogni passaggio di proprietà è registrato sulla blockchain".
- Costi: "una commissione di tokenizzazione e commissioni sulle operazioni".
- FAQ: costi, tempi, gestione, fine dell'investimento.

Domanda di fondo per il legale: **qualifica giuridica dei token** (strumenti finanziari, cripto-attività ai sensi del MiCAR o altro) e quindi quali autorizzazioni o partner servono per l'offerta, e quali parole si possono usare ("investimento", "rendita", "offerta", "quota").

---

## 4. Dati e materiali che servono da Myntas

1. ~~Dati societari per il footer~~ **Fatto**: P.IVA e C.F. 07577500486, REA FI-713175, capitale sociale 100,00 € i.v. (dalla visura del 25/09/2026), nel footer di ogni pagina e nell'informativa privacy.
2. **Destinazione dei moduli** (`/api/lead`): Notion, email o entrambi. Senza endpoint, chi compila un modulo vede solo un messaggio con info@myntas.com.
3. **Permessi scritti dei partner** mostrati in "Trusted by" (Lexify, altiqa, LTBA, blocksquare) e di Nova Ventures. Modello di richiesta qui sotto.
4. **Logo Nova Ventures** in SVG o PNG grande.
5. **Obbligo di pubblicazione per start-up innovative.** Myntas è iscritta nella sezione speciale delle start-up innovative (25/09/2026). L'art. 25, commi 11 e 12, del DL 179/2012 chiede di rendere disponibili **sul sito della società** e di aggiornare almeno ogni sei mesi: data e luogo di costituzione, nome e indirizzo del notaio; sede; oggetto sociale; descrizione dell'attività svolta, comprese le spese in ricerca e sviluppo; elenco dei soci (con trasparenza su fiduciarie e holding) e autocertificazione di veridicità; elenco delle società partecipate; titoli di studio ed esperienze professionali dei soci e del personale (escluse informazioni personali non pertinenti); relazioni con incubatori, investitori, università; ultimo bilancio depositato; elenco dei diritti di privativa. Posso creare una pagina dedicata (per esempio `/start-up-innovativa/`, linkata dal footer) con i dati della visura: serve il tuo via libera, perché riporta nomi dei soci e percorsi professionali. Il legale confermi l'elenco dei contenuti e la formulazione.

### Modello di email ai partner

> Oggetto: Uso del vostro logo sul sito myntas.com
>
> Buongiorno,
> stiamo pubblicando il nuovo sito di Myntas (myntas.com) e vorremmo mostrare il vostro logo nella sezione "Trusted by", insieme a quelli degli altri partner, senza altri riferimenti o dichiarazioni.
> Vi chiediamo una conferma scritta che possiamo farlo, ed eventualmente il file del logo che preferite usiamo. Potete revocare il permesso in qualsiasi momento scrivendo a info@myntas.com.
> Grazie,
> Il team Myntas

---

## 5. Prima di togliere il blocco ai motori di ricerca

Finché questi punti non sono chiusi il sito resta con `noindex` e `robots.txt` in modalità staging, anche su myntas.com:

- [ ] Approvazione del legale (sezione 3)
- [x] Dati societari nel footer (sezione 4.1)
- [ ] `/api/lead` attivo (sezione 4.2)
- [ ] Permessi dei partner (sezione 4.3)
- [ ] Dominio collegato e posta verificata (sezione 1)
- [ ] Pagina "Start-up innovativa" (sezione 4.5)
