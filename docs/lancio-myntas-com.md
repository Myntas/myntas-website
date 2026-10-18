# Lancio di myntas.com: dominio e parte legale

Documento interno (non pubblicato: sta fuori da `public/`). Aggiornato al 18 ottobre 2026.

---

## 1. Collegare myntas.com al sito (Cloudflare)

Il sito è il Worker **`myntas-website`** (indirizzo di test: `myntas-website.fragrant-waterfall-55f0.workers.dev`).
Oggi `myntas.com` serve l'app Base44 (per esempio `myntas.com/Account`): quando il dominio passa al sito, l'app su quel dominio smette di funzionare. Spostala prima su un sottodominio.

### Passo 0. Sposta l'app Base44 su un sottodominio
1. Nelle impostazioni di Base44, aggiungi il dominio personalizzato **`app.myntas.com`** e segui le istruzioni DNS che ti dà (di solito un record CNAME).
2. Crea quel record in Cloudflare (DNS → Records), verifica che `https://app.myntas.com` apra l'app.
3. Avvisa gli utenti attuali del nuovo indirizzo. Se vuoi, aggiungo sul sito un reindirizzamento da `myntas.com/Account` a `app.myntas.com/Account`: dimmelo quando il sottodominio funziona.

### Passo 1. Il dominio deve essere gestito da Cloudflare
- In Cloudflare, apri **Websites**: se `myntas.com` è già nell'elenco con stato **Active**, vai al passo 2.
- Se non c'è: **Add a site** → `myntas.com` → piano Free → Cloudflare importa i record DNS esistenti. Controlla che ci siano tutti (soprattutto i record **MX** della posta e quelli di Base44), poi cambia i **nameserver** presso il registrar del dominio con i due indicati da Cloudflare. Il passaggio può richiedere da pochi minuti a 24 ore.
- Importante: **non toccare i record MX e TXT della posta**, altrimenti info@myntas.com smette di ricevere.

### Passo 2. Libera myntas.com e www
In **DNS → Records** elimina (o annota e poi elimina) i record **A, AAAA o CNAME** per `myntas.com` (nome `@`) e per `www` che oggi puntano a Base44. Cloudflare non permette di collegare il Worker se esiste già un record per lo stesso nome. Lascia intatti MX, TXT e il CNAME di `app`.

### Passo 3. Collega il dominio al Worker
1. **Workers & Pages** → **myntas-website** → **Settings** → **Domains & Routes** → **Add** → **Custom domain**.
2. Scrivi `myntas.com` → **Add domain**. Cloudflare crea il record DNS e il certificato HTTPS da solo (qualche minuto).
3. Ripeti con `www.myntas.com`.
4. Facoltativo ma consigliato: **Rules → Redirect Rules** → "Redirect from WWW to root" (modello pronto), così `www.myntas.com` porta sempre a `myntas.com`.

### Passo 4. Verifica
- Apri `https://myntas.com`, `https://myntas.com/aurea/`, `https://myntas.com/en/` e una pagina inesistente (deve comparire la pagina 404 di Myntas).
- Dimmelo: aggiungo il dominio anche in `wrangler.jsonc`, così ogni deploy automatico lo mantiene, e decidiamo insieme quando togliere il blocco ai motori di ricerca (vedi sezione 4).

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

1. **Dati societari per il footer** (art. 2250 c.c. e art. 35 DPR 633/1972): P.IVA, numero REA e Camera di commercio, capitale sociale (e se interamente versato), eventuale "società unipersonale". Oggi il footer dice "P.IVA in attribuzione".
2. **Destinazione dei moduli** (`/api/lead`): Notion, email o entrambi. Senza endpoint, chi compila un modulo vede solo un messaggio con info@myntas.com.
3. **Permessi scritti dei partner** mostrati in "Trusted by" (Lexify, altiqa, LTBA, blocksquare) e di Nova Ventures. Modello di richiesta qui sotto.
4. **Logo Nova Ventures** in SVG o PNG grande.

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
- [ ] Dati societari nel footer (sezione 4.1)
- [ ] `/api/lead` attivo (sezione 4.2)
- [ ] Permessi dei partner (sezione 4.3)
- [ ] App Base44 su `app.myntas.com`
