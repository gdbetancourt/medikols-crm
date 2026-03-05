const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.options('*', cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway')
    ? { rejectUnauthorized: false }
    : false,
});

// ── SEED DATA ──────────────────────────────────────────────────────────────────
const SEED_PROSPECTS = [
  {id:"p01",name:"Centro Dermatológico Tennyson",specialty:"Dermatología",city:"CDMX - Polanco",phone:"55 5203 6454",wa:"55 2543 3927",ig:"@dermatologicotennyson",source:"Google Maps",reviews:204,score:12,grade:"A",status:"Nuevo",notes:"Tennyson 241. 4.7★ GMaps. Cierra 8pm. WA e IG confirmados en dermatologicotennyson.mx"},
  {id:"p02",name:"Dra. Carolina Hernandez Zepeda",specialty:"Dermatología",city:"CDMX - Benito Juárez",phone:"55 8869 4737",wa:"",ig:"@dracarohz.derma",source:"Doctoralia",reviews:834,score:9,grade:"B",status:"Llamar",notes:"Hospital San Angel Inn Universidad Torre II Piso 4 Cons. 447. Río Churubusco 601. $1,500. 2do tel: 55 5086 4543."},
  {id:"p03",name:"Dr. Juan Oswaldo Colmenero Mercado",specialty:"Dermatología",city:"CDMX - Polanco",phone:"55 4163 0177",wa:"",ig:"@droswaldo.derma",source:"Doctoralia",reviews:612,score:9,grade:"B",status:"Llamar",notes:"Consultorio dermatológico Polanco. Rubén Darío 13. $1,500. 2do consultorio en Hospital Angeles Universidad."},
  {id:"p04",name:"Dr. Rubén David Bravo Fernández",specialty:"Pediatría",city:"Monterrey - Apodaca",phone:"81 2763 0558",wa:"",ig:"@dr_rubenbravo_pedia",source:"Doctoralia",reviews:526,score:9,grade:"B",status:"Nuevo",notes:"KRESKAS PEDIA. Miguel Hidalgo y Costilla 603b. $700. Especialista de confianza. También Facebook."},
  {id:"p05",name:"Dr. Ignacio Reyes Urrutia",specialty:"Ginecología",city:"CDMX - Benito Juárez",phone:"55 5682 0840",wa:"",ig:"@dr.ignacioreyesurrutia",source:"Doctoralia",reviews:508,score:9,grade:"B",status:"Llamar",notes:"Hospital Ángeles Universidad. Av. Universidad 1080. Sitio: ignacioreyesurrutia-ginecologo.com. Cirugía robótica."},
  {id:"p06",name:"Dra. Claudia Cázares",specialty:"Dermatología",city:"CDMX - Col del Valle Centro",phone:"55 4178 2100",wa:"",ig:"@claudia.cazares",source:"Doctoralia",reviews:503,score:9,grade:"B",status:"Nuevo",notes:"Groove: Alta especialidad en Dermatología. Insurgentes Sur 826 Piso 2. $1,600. No acepta aseguradoras. Tiene sitio web."},
  {id:"p07",name:"Dra. Annette Valerie Gaspard",specialty:"Ginecología",city:"CDMX - La Magdalena Contreras",phone:"(oculto en Doctoralia)",wa:"",ig:"@draannettegaspard",source:"Doctoralia",reviews:288,score:9,grade:"B",status:"Nuevo",notes:"Hospital Angeles Pedregal. CLINIFEM CENTRO. Sta. Teresa 1055-S. $1,500. También YouTube."},
  {id:"p08",name:"Dra. Pamela Denis Lozano Montes",specialty:"Pediatría",city:"Monterrey - Miravalle",phone:"81 2466 1949",wa:"",ig:"@pediatraenmonterrey",source:"Doctoralia",reviews:247,score:9,grade:"B",status:"Nuevo",notes:"Swiss Hospital Centro Médico Calzada Piso 3. Calzada San Pedro 121. $1,000. También Facebook y YouTube."},
  {id:"p09",name:"Dra. Mariana Sarao Pineda",specialty:"Dermatología",city:"CDMX - Polanco (Miguel Hidalgo)",phone:"55 9302 0288",wa:"",ig:"Sí (perfil confirmado en Doctoralia)",source:"Doctoralia + Google Maps",reviews:120,score:8,grade:"B",status:"Llamar",notes:"DERMATOLOGÍA SARAO. Arquímedes 130, Polanco. $1,400. También Facebook. Coincide con Dermédica Polanco en GMaps."},
  {id:"p10",name:"Dra. Natalia Cerda Corona",specialty:"Ginecología",city:"CDMX - Álvaro Obregón",phone:"55 1059 7381",wa:"",ig:"Sí (perfil confirmado en Doctoralia)",source:"Doctoralia",reviews:383,score:7,grade:"B",status:"Nuevo",notes:"Tu Gineco. Av. Toluca 506. $1,300. También Facebook y sitio web."},
  {id:"p11",name:"PielClinic Polanco",specialty:"Dermatología",city:"CDMX - Polanco",phone:"55 9000 4625",wa:"",ig:"",source:"Google Maps",reviews:303,score:7,grade:"B",status:"Llamar",notes:"Corp. Miyana, Av. Ejército Nacional 769 Piso 4. 4.2★. Tiene sitio web. Verificar WA/IG en sitio."},
  {id:"p12",name:"GINESTETICS - Dra. Tere Guerrero",specialty:"Ginecología",city:"CDMX - Narvarte Poniente",phone:"55 8368 3504",wa:"",ig:"",source:"Google Maps",reviews:273,score:7,grade:"B",status:"Nuevo",notes:"Torre Esp. San Ángel Inn Acora del Valle. Av. Cuauhtémoc 1040. 5.0★. Sin sitio web en GMaps. Verificar IG."},
  {id:"p13",name:"Dr. Alfonso Mazatán Dávila",specialty:"Pediatría / Neonatología",city:"Monterrey - Balcones de Galerías",phone:"81 1050 7604",wa:"",ig:"Sí (perfil confirmado en Doctoralia)",source:"Doctoralia",reviews:252,score:7,grade:"B",status:"Nuevo",notes:"Consultorio privado. Ecuador 2331. Distinción Doctoralia. Facebook también."},
  {id:"p14",name:"Dra. Valeria Ventura Quintana",specialty:"Ginecología",city:"CDMX - Narvarte Poniente",phone:"55 3452 4613",wa:"",ig:"",source:"Google Maps",reviews:189,score:7,grade:"B",status:"Nuevo",notes:"Av. Cuauhtémoc 1040. 4.9★. Tiene sitio web. Verificar WA/IG."},
  {id:"p15",name:"GinecoB Vida",specialty:"Ginecología",city:"CDMX - Narvarte Poniente",phone:"55 8010 0066",wa:"",ig:"",source:"Google Maps",reviews:170,score:7,grade:"B",status:"Nuevo",notes:"Acora del Valle, Av. Cuauhtémoc 1040 Cons. 1158. 5.0★. Tiene sitio web. Verificar WA/IG."},
  {id:"p16",name:"Dra. Aimeé Yazmín Ruiz Flores",specialty:"Pediatría",city:"Monterrey - Centro",phone:"81 4762 7891",wa:"",ig:"",source:"Doctoralia",reviews:158,score:7,grade:"B",status:"Llamar",notes:"Centro Médico Hospital San José Cons. 202-204. Av. Morones Prieto 3000. $1,100. 20+ años exp. Sin IG ni WA visible."},
  {id:"p17",name:"Dr. Edwin Mendoza Ramirez",specialty:"Ginecología",city:"CDMX - Miguel Hidalgo",phone:"55 9662 3761",wa:"",ig:"",source:"Doctoralia",reviews:109,score:7,grade:"B",status:"Llamar",notes:"Hospital Angeles México Cons. 853 Torre B. Agrarismo 208. $1,500. Tiene sitio web. Sin Instagram visible."},
  {id:"p18",name:"Dra. Paola García Ruiz",specialty:"Ginecología",city:"CDMX - Narvarte",phone:"55 7563 3553",wa:"",ig:"",source:"Google Maps",reviews:77,score:7,grade:"B",status:"Nuevo",notes:"C. Dr. José María Vértiz 995. 4.6★. Reserva en línea. Tiene sitio web. Verificar WA/IG."},
  {id:"p19",name:"Dermará",specialty:"Dermatología",city:"CDMX - Polanco",phone:"55 4140 2492",wa:"",ig:"",source:"Google Maps",reviews:35,score:7,grade:"B",status:"Nuevo",notes:"Av. Homero 538. 4.9★ GMaps. Cierra 7pm. Tiene sitio web. Verificar WA/IG en sitio."},
  {id:"p20",name:"Dra. Rossana Janina Llergo Valdez",specialty:"Dermatología",city:"CDMX - Polanco",phone:"55 2961 3111",wa:"",ig:"",source:"Google Maps",reviews:19,score:5,grade:"C",status:"Nuevo",notes:"Petrarca 223 Int. 204. 5.0★ GMaps. Tiene sitio web. Verificar WA/IG en sitio."},
];

// ── INIT DB ────────────────────────────────────────────────────────────────────
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS prospects (
      id TEXT PRIMARY KEY,
      name TEXT,
      specialty TEXT,
      city TEXT,
      phone TEXT,
      wa TEXT,
      ig TEXT,
      source TEXT,
      reviews INTEGER,
      score INTEGER,
      grade TEXT,
      status TEXT,
      notes TEXT,
      sin_wa BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Add sin_wa column if table already existed without it
  await pool.query(`
    ALTER TABLE prospects ADD COLUMN IF NOT EXISTS sin_wa BOOLEAN DEFAULT FALSE
  `);

  const { rows } = await pool.query('SELECT count(*)::int AS cnt FROM prospects');
  if (rows[0].cnt === 0) {
    console.log('Seeding 20 prospects...');
    for (const p of SEED_PROSPECTS) {
      await pool.query(
        `INSERT INTO prospects (id,name,specialty,city,phone,wa,ig,source,reviews,score,grade,status,notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [p.id, p.name, p.specialty, p.city, p.phone, p.wa, p.ig, p.source, p.reviews, p.score, p.grade, p.status, p.notes]
      );
    }
    console.log('Seed complete.');
  }
}

// ── API ROUTES ─────────────────────────────────────────────────────────────────
app.get('/api/prospects', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM prospects ORDER BY created_at ASC');
    res.json(rows);
  } catch (err) {
    console.error('GET /api/prospects error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/prospects', async (req, res) => {
  try {
    const p = req.body;
    const id = p.id || 'u' + Date.now();
    const { rows } = await pool.query(
      `INSERT INTO prospects (id,name,specialty,city,phone,wa,ig,source,reviews,score,grade,status,notes,sin_wa)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [id, p.name, p.specialty, p.city, p.phone, p.wa, p.ig, p.source, p.reviews||0, p.score||0, p.grade||'B', p.status||'Nuevo', p.notes||'', p.sin_wa||false]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/prospects error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/prospects/:id', async (req, res) => {
  try {
    const p = req.body;
    const { rows } = await pool.query(
      `UPDATE prospects SET name=$1,specialty=$2,city=$3,phone=$4,wa=$5,ig=$6,source=$7,reviews=$8,score=$9,grade=$10,status=$11,notes=$12,sin_wa=$13
       WHERE id=$14 RETURNING *`,
      [p.name, p.specialty, p.city, p.phone, p.wa, p.ig, p.source, p.reviews, p.score, p.grade, p.status, p.notes, p.sin_wa||false, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('PUT /api/prospects error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/prospects/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM prospects WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  } catch (err) {
    console.error('DELETE /api/prospects error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── START ──────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

initDB()
  .then(() => {
    app.listen(PORT, () => console.log(`MediKOLs CRM running on port ${PORT}`));
  })
  .catch(err => {
    console.error('DB init failed:', err);
    process.exit(1);
  });
