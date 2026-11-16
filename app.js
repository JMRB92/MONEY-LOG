'use strict';
// MONEY LOG v1.02 revisada. Este identificador se conserva para leer los datos de v1.01/v1.02.
const STORAGE_KEY = 'moneylog_v101';
const VERSION = '1.02';
const $ = id => document.getElementById(id);
const uuid = () => (globalThis.crypto?.randomUUID?.() || ('ml-'+Date.now()+'-'+Math.random().toString(36).slice(2)));
const isoDate = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const thisMonth = () => isoDate().slice(0,7);
const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num = v => Number(v) || 0;
const cents = n => Math.round((num(n) + Number.EPSILON) * 100) / 100;
const money = amount => new Intl.NumberFormat('es-ES',{style:'currency',currency:db.settings.currency || 'EUR'}).format(cents(amount));
const fmtDate = str => /^\d{4}-\d{2}-\d{2}$/.test(str||'') ? new Date(str+'T12:00:00').toLocaleDateString('es-ES') : String(str ?? '');
const typeLabels = {income:'Ingreso',expense:'Gasto',transfer:'Transferencia'};
const frequencyLabels = {weekly:'Semanal',monthly:'Mensual',yearly:'Anual'};
const pages = ['Inicio','Movimientos','Cuentas','Categorías','Presupuestos','Recurrentes','Metas','Estadísticas','Informes','Ajustes'];
const defaultCategories = ['Alimentación','Vivienda','Transporte','Ocio','Salud','Compras','Educación','Servicios','Nómina','Otros'];
const HELP = {
  'Inicio':['Inicio y resumen','Este panel muestra el dinero total de tus cuentas, lo ingresado y gastado este mes y cuánto te ha quedado. Para empezar, crea o edita una cuenta y registra tu primer movimiento.'],
  'Movimientos':['¿Para qué sirven los movimientos?','Un ingreso aumenta el dinero de una cuenta, un gasto lo reduce y una transferencia lo traslada entre dos cuentas sin modificar el total. Puedes filtrar, editar, duplicar y borrar operaciones.'],
  'Cuentas':['Cómo utilizar Cuentas','Añade una entrada por cada banco, efectivo o tarjeta que quieras controlar. El saldo inicial es el dinero que ya había antes del primer movimiento registrado. El saldo actual se calcula automáticamente.'],
  'Categorías':['Cómo utilizar Categorías','Organiza los gastos e ingresos con etiquetas como Alimentación, Nómina o Transporte. Selecciona estas categorías al registrar movimientos; así podrás analizar en qué gastas y crear presupuestos.'],
  'Presupuestos':['Cómo utilizar Presupuestos','Establece un límite mensual para una categoría. La aplicación suma los gastos de esa categoría del mes en curso. Amarillo: has alcanzado el 80 %. Rojo: has alcanzado o superado el límite.'],
  'Recurrentes':['Qué son los movimientos recurrentes','Configura ingresos o gastos que se repiten semanal, mensual o anualmente. Al abrir MONEY LOG se generan los vencimientos hasta hoy. Pausa una regla si no debe seguir registrando importes. No se ejecutan mientras la aplicación está cerrada.'],
  'Metas':['Cómo funcionan las metas','Define cuánto quieres ahorrar para un objetivo y registra aportaciones para ver el progreso. Las metas sirven de seguimiento: registrar una aportación no descuenta dinero de ninguna cuenta.'],
  'Estadísticas':['Cómo interpretar las estadísticas','Consulta ingresos, gastos, saldo de ahorro, porcentaje de ahorro, distribución por categorías y comparación de los últimos seis meses. Las transferencias internas no cuentan como ingresos ni gastos.'],
  'Informes':['Informes y exportaciones','Elige un mes y descarga un CSV para Excel o genera un informe con la opción Imprimir/Guardar como PDF. La copia JSON guarda todos tus registros y configuraciones. Restaurarla sustituye la información actual.'],
  'Ajustes':['Ajustes y privacidad','Elige la moneda para mostrar cantidades y el tema de color. Cambiar moneda NO convierte las cantidades. Todos los datos quedan en este navegador: realiza copias JSON por seguridad.'],
  'Saldo total':['Saldo total','Suma de los saldos actuales de todas tus cuentas. Cada cuenta empieza por su saldo inicial y se modifica con los ingresos, gastos y transferencias que registras.'],
  'Ingresos del mes':['Ingresos del mes','Suma de los movimientos marcados como Ingreso en el mes actual. Las transferencias entre cuentas no se cuentan.'],
  'Gastos del mes':['Gastos del mes','Suma de los movimientos marcados como Gasto en el mes actual. Los movimientos transferidos entre cuentas no cuentan como gastos.'],
  'Ahorro del mes':['Ahorro del mes','Diferencia entre ingresos y gastos del mes. No es el saldo total de tus cuentas: puedes disponer de dinero acumulado de meses anteriores.'],
  'Acciones rápidas':['Registrar movimientos','Ingreso: dinero que recibes. Gasto: dinero que pagas. Transferencia: dinero que mueves entre tus cuentas. Es importante elegir el tipo correcto para que los informes no se falseen.'],
  'Tus cuentas':['Tus cuentas','Resumen de cada cuenta y su saldo actualizado. Puedes cambiar el nombre o saldo de partida en la pestaña Cuentas.'],
  'Últimos movimientos':['Últimos movimientos','Los movimientos más recientes. Para editar, duplicar, filtrar o borrar uno, entra en Movimientos.'],
  'Filtrar movimientos':['Buscar y filtrar','Elige un mes, cuenta, tipo o categoría. Escribe palabras en la búsqueda para localizar conceptos. Los filtros no modifican ni eliminan datos.'],
  'Lista de movimientos':['Lista de movimientos','Aquí aparecen los movimientos que cumplen los filtros. Editar cambia su información, Duplicar crea uno nuevo con los mismos datos y fecha actual, y Eliminar lo borra definitivamente.'],
  'Cuentas y saldos':['Saldo y cuentas','El saldo inicial es el importe que tenías cuando empezaste a utilizar la aplicación. Los cobros, pagos y transferencias van modificando el saldo actual.'],
  'Categorías personalizadas':['Categorías personalizadas','Crea, edita o elimina etiquetas. Si una categoría ya se está utilizando, al cambiarle el nombre los registros existentes se actualizarán.'],
  'Límites mensuales':['Límites mensuales','Cada presupuesto se aplica a una categoría y se renueva automáticamente al empezar otro mes. El gasto real procede de los movimientos que registres.'],
  'Pagos y cobros habituales':['Pagos y cobros habituales','Una regla recurrente puede pausarse o reactivarse. Al abrir la aplicación, registra automáticamente las fechas vencidas de las reglas activas. Revisa que no hayas apuntado el mismo cargo a mano.'],
  'Tus objetivos':['Tus objetivos','Cada meta tiene un importe objetivo y una cantidad ahorrada. Usa Aportar para sumar dinero al progreso. Es una cifra informativa, no una transferencia bancaria real.'],
  'Gastos por categoría':['Gastos por categoría','Indica en qué categorías se concentra el gasto del mes actual, ordenadas de mayor a menor. Los movimientos sin categoría aparecen como Sin categoría.'],
  'Evolución últimos 6 meses':['Evolución últimos 6 meses','Compara gráficamente los ingresos (verde) y gastos (rojo) de cada mes. El crecimiento o descenso del gasto es más claro cuando registras los movimientos con regularidad.'],
  'Comparativa mensual':['Comparativa mensual','La tasa de ahorro es el ahorro dividido entre los ingresos del mes, expresado en porcentaje. Si no hay ingresos, la tasa no se calcula. Comparamos el gasto con el mes anterior.'],
  'Exportar datos':['Exportar datos','CSV exporta los movimientos del mes elegido. Imprimir PDF abre una vista de impresión. JSON guarda una copia completa, necesaria para recuperar los datos en otro navegador.'],
  'Restaurar datos':['Restaurar datos','Elige una copia JSON de MONEY LOG. Antes de sustituir tus datos, se comprobará el archivo y se mostrará un resumen de su contenido. Descarga una copia de tus datos actuales si deseas conservarlos.'],
  'Preferencias':['Preferencias','Personaliza el color y el símbolo monetario. El cambio de moneda afecta al formato mostrado, pero no al valor de los importes existentes.'],
  'Mantenimiento':['Mantenimiento','Guarda una copia JSON periódicamente para evitar pérdidas. Borrar todos los datos eliminará los registros del navegador y no podrá deshacerse sin una copia externa.'],
  'amount':['Cantidad','Introduce una cantidad positiva; el tipo de movimiento determina si suma o resta.'],
  'opening':['Saldo inicial','Introduce el dinero que había en esa cuenta antes del primer movimiento registrado en MONEY LOG; no vuelvas a anotarlo como ingreso.'],
  'account':['Cuenta de origen','Selecciona la cuenta que recibe el ingreso o paga el gasto. En una transferencia, indica la cuenta desde la que sale el dinero.'],
  'to':['Cuenta de destino','Selecciona la cuenta a la que llega el dinero. Debe ser distinta de la cuenta de origen.'],
  'category':['Categoría','Selecciona la etiqueta que mejor describe el movimiento para alimentar los presupuestos y estadísticas.'],
  'date':['Fecha del movimiento','Indica cuándo tuvo lugar el cobro, pago o transferencia.'],
  'note':['Concepto','Escribe una descripción que te permita identificar fácilmente el movimiento, como Compra supermercado o Nómina noviembre.'],
  'frequency':['Periodicidad','Indica cada cuánto se repite: semanalmente, mensualmente o una vez al año.'],
  'next':['Próxima fecha','Primera fecha desde la que la aplicación debe empezar a generar estos movimientos automáticamente.'],
  'target':['Objetivo','Importe total que deseas alcanzar con la meta de ahorro.'],
  'saved':['Ya ahorrado','Cantidad que ya has separado para esta meta. No se suma ni se resta a ninguna cuenta.'],
  'budget-limit':['Límite mensual','Cantidad máxima que te propones gastar al mes en esa categoría.'],
  'currency':['Moneda','El símbolo elegido se usa para mostrar las cantidades; no se realiza conversión de divisas.'],
  'theme':['Apariencia','Selecciona un tema oscuro o claro.'],
  'report-month':['Mes del informe','Los CSV y PDF incluyen solamente los movimientos del mes seleccionado. La copia JSON incluye todos los datos.']
};
function newData(){return {version:1,accounts:[{id:uuid(),name:'Cuenta principal',opening:0}],categories:[...defaultCategories],transactions:[],budgets:[],recurring:[],goals:[],settings:{currency:'EUR',theme:'dark'}};}
let db;
try{db=JSON.parse(localStorage.getItem(STORAGE_KEY)) || newData();}catch{db=newData();}
function normalizeData(data){
  if(!data || typeof data!=='object' || Array.isArray(data)) return newData();
  for(const key of ['accounts','categories','transactions','budgets','recurring','goals']) if(!Array.isArray(data[key]))data[key]=[];
  if(!data.settings || typeof data.settings!=='object')data.settings={};
  if(!['EUR','USD','GBP','CHF','MXN'].includes(data.settings.currency))data.settings.currency='EUR';
  if(!['light','dark'].includes(data.settings.theme))data.settings.theme='dark';
  if(!data.accounts.length)data.accounts.push({id:uuid(),name:'Cuenta principal',opening:0});
  for(const rule of data.recurring){if(rule.active===undefined)rule.active=true;if(!rule.anchorDay && /^\d{4}-\d{2}-\d{2}$/.test(rule.next||''))rule.anchorDay=Number(rule.next.slice(-2));}
  for(const goal of data.goals)if(!Array.isArray(goal.history))goal.history=[];
  return data;
}
db=normalizeData(db);
const state={page:'Inicio',month:thisMonth(),query:'',type:'all',account:'all',category:'all',reportMonth:thisMonth()};
let editContext=null;
function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(db));render();return true;}catch(err){alert('No ha sido posible guardar. Revisa el almacenamiento del navegador y crea una copia de seguridad.');return false;}}
function notify(msg){document.getElementById('toast')?.remove();const node=document.createElement('div');node.id='toast';node.textContent=msg;document.body.appendChild(node);setTimeout(()=>node.remove(),2900);}
function accountName(id){return db.accounts.find(a=>a.id===id)?.name || 'Cuenta no disponible';}
function balance(id){return cents(num(db.accounts.find(a=>a.id===id)?.opening)+db.transactions.reduce((s,t)=>s+(t.account===id?(t.type==='income'?num(t.amount):t.type==='expense'||t.type==='transfer'?-num(t.amount):0):0)+(t.type==='transfer'&&t.to===id?num(t.amount):0),0));}
function totals(m){return db.transactions.filter(t=>typeof t.date==='string'&&t.date.startsWith(m)).reduce((r,t)=>{if(t.type==='income')r.income+=num(t.amount);if(t.type==='expense')r.expense+=num(t.amount);return r;},{income:0,expense:0});}
function previousMonth(m){const [y,mm]=m.split('-').map(Number);return `${mm===1?y-1:y}-${String(mm===1?12:mm-1).padStart(2,'0')}`;}
const opts=(arr,selected)=>arr.map(x=>`<option value="${e(x.id??x)}" ${String(x.id??x)===String(selected)?'selected':''}>${e(x.name??x)}</option>`).join('');
const btn=(label,action,className='')=>`<button type="button" class="${e(className)}" data-action="${e(action)}">${label}</button>`;
const help=(key)=>`<button type="button" class="help-icon" data-help="${e(key)}" title="¿Qué es esto?" aria-label="Información: ${e(key)}">i</button>`;
function pageHead(title,subtitle,actions=''){return `<div class="page-heading"><div><div class="heading-title"><h2>${e(title)}</h2>${help(title)}</div><p>${e(subtitle)}</p></div><div class="actions">${actions}</div></div>`;}
function cardHead(title,actions=''){return `<div class="card-head"><div class="head-text"><h3>${e(title)}</h3>${help(title)}</div><div class="actions">${actions}</div></div>`;}
const empty=(msg='Todavía no hay registros.')=>`<div class="empty">${e(msg)}</div>`;
function list(items,fn,msg){return items.length?`<div class="list">${items.map(fn).join('')}</div>`:empty(msg);}
function kpi(label,value,klass=''){return `<div class="card"><div class="row"><span class="kpi-label">${e(label)}</span>${help(label)}</div><div class="kpi-value ${klass}">${value}</div></div>`;}
function summary(){const t=totals(thisMonth()),bal=db.accounts.reduce((s,a)=>s+balance(a.id),0);return `<div class="kpis">${kpi('Saldo total',money(bal))}${kpi('Ingresos del mes',money(t.income),'positive')}${kpi('Gastos del mes',money(t.expense),'negative')}${kpi('Ahorro del mes',money(t.income-t.expense),t.income-t.expense>=0?'positive':'negative')}</div>`;}
function spendOf(b,m){return db.transactions.filter(t=>t.type==='expense'&&t.category===b.category&&t.date?.startsWith(m)).reduce((s,t)=>s+num(t.amount),0);}
function budgetItem(b,m){const spent=spendOf(b,m),pct=b.limit>0?spent/b.limit*100:0,level=pct>=100?'danger':pct>=80?'warning':'',label=pct>=100?'Límite alcanzado':pct>=80?'Cerca del límite':'Dentro del límite';return `<div class="item"><div class="item-body"><div class="row"><div><div class="item-title">${e(b.category)}</div><div class="item-meta">${money(spent)} de ${money(b.limit)} · <span class="${pct>=100?'bad':pct>=80?'warn':'good'}">${label}</span></div></div><span class="tag ${pct>=100?'bad':pct>=80?'warn':'good'}">${Math.round(pct)} %</span></div><div class="bartrack"><div class="barfill ${level}" style="width:${Math.min(100,Math.max(0,pct))}%"></div></div></div><div class="item-actions">${btn('Editar','edit-budget:'+b.id)}${btn('Eliminar','delete-budget:'+b.id,'danger')}</div></div>`;}
function movementItem(t){const colour=t.type==='income'?'positive':t.type==='expense'?'negative':'',prefix=t.type==='income'?'+':t.type==='expense'?'−':'⇄';const account=t.type==='transfer'?`${accountName(t.account)} → ${accountName(t.to)}`:accountName(t.account);return `<div class="item"><div class="item-body"><div class="item-title">${e(t.note||t.category||typeLabels[t.type]||'Movimiento')}</div><div class="item-meta">${fmtDate(t.date)} · ${e(typeLabels[t.type]||t.type)} · ${e(account)} ${t.category?'· '+e(t.category):''}</div></div><div class="item-end"><strong class="${colour}">${prefix} ${money(t.amount)}</strong><div class="item-actions">${btn('Editar','edit-transaction:'+t.id)}${btn('Duplicar','duplicate-transaction:'+t.id)}${btn('Eliminar','delete-transaction:'+t.id,'danger')}</div></div></div>`;}
function viewInicio(){
  const recent=[...db.transactions].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5),spent=db.budgets.filter(b=>spendOf(b,thisMonth())>=b.limit*.8);
  return pageHead('Inicio','Un resumen claro de tus finanzas y lo que ha pasado este mes.')+
    (db.transactions.length===0?`<div class="notice"><strong>Empieza en 3 pasos:</strong> 1. Revisa el saldo inicial de tu cuenta. 2. Añade un ingreso o gasto. 3. Consulta el resultado aquí. ${btn('Ver guía','guide')}</div>`:'')+
    summary()+`<div class="card">${cardHead('Acciones rápidas')}<div class="actions">${btn('+ Ingreso','add-income','primary')}${btn('− Gasto','add-expense')}${btn('⇄ Transferencia','add-transfer')}</div></div>`+
    (spent.length?`<div class="notice alert"><strong>Atención a tus presupuestos:</strong> ${spent.length} categoría(s) al 80 % o más de su límite. ${btn('Revisar presupuestos','go-Presupuestos')}</div>`:'')+
    `<div class="grid"><section class="card">${cardHead('Tus cuentas',btn('Ver cuentas','go-Cuentas'))}${list(db.accounts,a=>`<div class="item"><div class="item-title">${e(a.name)}</div><strong>${money(balance(a.id))}</strong></div>`)}</section><section class="card">${cardHead('Últimos movimientos',btn('Ver todos','go-Movimientos'))}${list(recent,t=>`<div class="item"><div class="item-body"><div class="item-title">${e(t.note||t.category||typeLabels[t.type])}</div><div class="item-meta">${fmtDate(t.date)}</div></div><strong class="${t.type==='income'?'good':t.type==='expense'?'bad':''}">${money(t.amount)}</strong></div>`,'Registra un ingreso o gasto para empezar.')}</section></div>`;
}
function filteredTransactions(){const q=state.query.toLocaleLowerCase('es');return [...db.transactions].filter(t=>
  (!state.month || t.date?.startsWith(state.month)) &&
  (state.type==='all'||t.type===state.type) &&
  (state.account==='all'||t.account===state.account||t.to===state.account) &&
  (state.category==='all'||t.category===state.category) &&
  (!q||[t.note,t.category,accountName(t.account),t.to&&accountName(t.to)].join(' ').toLocaleLowerCase('es').includes(q))
).sort((a,b)=>b.date.localeCompare(a.date));}
function viewMovimientos(){return pageHead('Movimientos','Registra cobros y pagos, busca operaciones y organiza tus cuentas.',`${btn('+ Ingreso','add-income','primary')}${btn('− Gasto','add-expense')}${btn('⇄ Transferencia','add-transfer')}`)+
  `<section class="card">${cardHead('Filtrar movimientos')}<div class="fields">
    <div class="field"><label for="f-month">Mes</label><input id="f-month" type="month" value="${e(state.month)}"></div>
    <div class="field"><label for="f-type">Tipo</label><select id="f-type"><option value="all">Todos</option>${opts(Object.entries(typeLabels).map(([id,name])=>({id,name})),state.type)}</select></div>
    <div class="field"><label for="f-account">Cuenta</label><select id="f-account"><option value="all">Todas las cuentas</option>${opts(db.accounts,state.account)}</select></div>
    <div class="field"><label for="f-category">Categoría</label><select id="f-category"><option value="all">Todas las categorías</option>${opts(db.categories,state.category)}</select></div>
    <div class="field"><label for="f-query">Buscar concepto</label><input id="f-query" value="${e(state.query)}" placeholder="Supermercado, gasolina..."></div></div>
    <div class="actions">${btn('Limpiar filtros','clear-filters','ghost')}<span class="subtle" id="filterCount"></span></div></section>
    <section class="card" style="margin-top:15px">${cardHead('Lista de movimientos')}<div id="movementResults"></div></section>`;}
function renderMovementResults(){const el=$('movementResults');if(!el)return;const items=filteredTransactions();el.innerHTML=list(items,movementItem,'No hay movimientos que coincidan con los filtros.');$('filterCount').textContent=`${items.length} movimiento(s) encontrados`;}
function viewCuentas(){return pageHead('Cuentas','Consulta el saldo de cada banco, tarjeta o efectivo.',btn('+ Nueva cuenta','add-account','primary'))+
  `<section class="card">${cardHead('Cuentas y saldos')}${list(db.accounts,a=>`<div class="item"><div class="item-body"><div class="item-title">${e(a.name)}</div><div class="item-meta">Saldo inicial: ${money(a.opening)}</div></div><div class="item-end"><strong>${money(balance(a.id))}</strong><div class="item-actions">${btn('Editar','edit-account:'+a.id)}${btn('Eliminar','delete-account:'+a.id,'danger')}</div></div></div>`)}</section>`;}
function viewCategorias(){return pageHead('Categorías','Personaliza cómo clasificas tus cobros y gastos.',btn('+ Categoría','add-category','primary'))+
  `<section class="card">${cardHead('Categorías personalizadas')}${list(db.categories,c=>`<div class="item"><strong>${e(c)}</strong><div class="item-actions">${btn('Editar','edit-category:'+encodeURIComponent(c))}${btn('Eliminar','delete-category:'+encodeURIComponent(c),'danger')}</div></div>`)}</section>`;}
function viewPresupuestos(){const alerts=db.budgets.filter(b=>spendOf(b,thisMonth())>=b.limit*.8);return pageHead('Presupuestos','Define límites de gasto para cada categoría.',btn('+ Presupuesto','add-budget','primary'))+
  `<section class="card">${cardHead('Límites mensuales')}<p class="subtle">Mes actual: ${e(thisMonth())}. Los límites se reinician al cambiar de mes.</p>${alerts.length?`<p class="notice alert">${alerts.length} presupuesto(s) han alcanzado el 80 % del límite o más.</p>`:''}${list(db.budgets,b=>budgetItem(b,thisMonth()),'Crea tu primer presupuesto para controlar los gastos mensuales.')}</section>`;}
function viewRecurrentes(){return pageHead('Recurrentes','Automatiza tus cobros y pagos habituales.',btn('+ Recurrente','add-recurring','primary'))+
  `<section class="card">${cardHead('Pagos y cobros habituales')}<p class="notice">Se generan los movimientos vencidos cuando abres la aplicación. Si la aplicación está cerrada, no se registran hasta la próxima apertura.</p>${list([...db.recurring].sort((a,b)=>a.next.localeCompare(b.next)),r=>`<div class="item"><div class="item-body"><div class="item-title">${e(r.note||r.category||typeLabels[r.type])} <span class="tag ${r.active===false?'bad':'good'}">${r.active===false?'Pausado':'Activo'}</span></div><div class="item-meta">${e(typeLabels[r.type])} · ${e(frequencyLabels[r.frequency]||r.frequency)} · próximo: ${fmtDate(r.next)} · ${e(accountName(r.account))}</div></div><div class="item-end"><strong>${money(r.amount)}</strong><div class="item-actions">${btn(r.active===false?'Reactivar':'Pausar','toggle-recurring:'+r.id)}${btn('Editar','edit-recurring:'+r.id)}${btn('Eliminar','delete-recurring:'+r.id,'danger')}</div></div></div>`,'Configura tu primer cobro o pago habitual.')}</section>`;}
function viewMetas(){return pageHead('Metas','Visualiza el ahorro destinado a tus objetivos.',btn('+ Nueva meta','add-goal','primary'))+
  `<section class="card">${cardHead('Tus objetivos')}${list(db.goals,g=>{const pct=g.target>0?num(g.saved)/num(g.target)*100:0;return `<div class="item"><div class="item-body"><div class="row"><div class="item-title">${e(g.name)}</div><span class="tag ${pct>=100?'good':''}">${Math.round(pct)} %</span></div><div class="item-meta">${money(g.saved)} ahorrado de ${money(g.target)} · ${money(Math.max(0,g.target-g.saved))} pendiente</div><div class="bartrack"><div class="barfill" style="width:${Math.min(100,Math.max(0,pct))}%"></div></div>${g.history.length?`<div class="small-note">Última aportación: ${fmtDate(g.history[g.history.length-1].date)}</div>`:''}</div><div class="item-actions">${btn('+ Aportar','add-contribution:'+g.id,'primary')}${btn('Editar','edit-goal:'+g.id)}${btn('Eliminar','delete-goal:'+g.id,'danger')}</div></div>`},'Crea una meta como Viaje, Emergencias o Nuevo ordenador.')}</section>`;}
function viewEstadisticas(){const m=thisMonth(),t=totals(m),prior=totals(previousMonth(m)),rate=t.income>0?`${(100*(t.income-t.expense)/t.income).toLocaleString('es-ES',{maximumFractionDigits:1})} %`:'—',change=prior.expense?`${(100*(t.expense-prior.expense)/prior.expense).toLocaleString('es-ES',{maximumFractionDigits:1})} %`:'—';let cats={};for(const x of db.transactions.filter(x=>x.type==='expense'&&x.date.startsWith(m))){const k=x.category||'Sin categoría';cats[k]=(cats[k]||0)+num(x.amount);}const rows=Object.entries(cats).sort((a,b)=>b[1]-a[1]);const monthly=[];let cur=m;for(let i=0;i<6;i++){monthly.unshift({m:cur,...totals(cur)});cur=previousMonth(cur);}const mx=Math.max(1,...monthly.flatMap(x=>[x.income,x.expense]));return pageHead('Estadísticas','Observa tendencias y entiende mejor en qué gastas.')+summary()+
  `<div class="grid"><section class="card">${cardHead('Comparativa mensual')}<div class="list"><div class="row"><span>Tasa de ahorro del mes</span><strong>${rate}</strong></div><hr><div class="row"><span>Gastos frente al mes anterior</span><strong>${change}</strong></div><hr><div class="row"><span>Gastos mes anterior</span><strong>${money(prior.expense)}</strong></div></div><p class="small-note">La tasa de ahorro se calcula como (ingresos − gastos) / ingresos.</p></section>
  <section class="card">${cardHead('Gastos por categoría')}${list(rows,([cat,value])=>`<div><div class="row"><span>${e(cat)}</span><strong>${money(value)}</strong></div><div class="bartrack"><div class="barfill" style="width:${Math.min(100,value/Math.max(.01,t.expense)*100)}%"></div></div></div>`,'Todavía no hay gastos para mostrar.')}</section></div>
  <section class="card" style="margin-top:15px">${cardHead('Evolución últimos 6 meses')}<div class="legend"><span class="dot in"></span>Ingresos <span class="dot out" style="margin-left:15px"></span>Gastos</div><div class="mini-chart" role="img" aria-label="Gráfico comparativo de ingresos y gastos de seis meses">${monthly.map(x=>`<div class="mini-col"><div class="mini-bars"><div class="mini-bar in" title="${e(x.m)} · ingresos: ${money(x.income)}" style="height:${Math.max(2,x.income/mx*145)}px"></div><div class="mini-bar out" title="${e(x.m)} · gastos: ${money(x.expense)}" style="height:${Math.max(2,x.expense/mx*145)}px"></div></div><div class="small-note">${e(x.m.slice(5))}/${e(x.m.slice(2,4))}</div></div>`).join('')}</div></section>`;}
function viewInformes(){return pageHead('Informes','Descarga informes mensuales y protege tus datos con copias locales.')+
  `<div class="grid"><section class="card">${cardHead('Exportar datos')}<div class="field"><label for="reportMonth">Mes del informe ${help('report-month')}</label><input type="month" id="reportMonth" value="${e(state.reportMonth)}"></div><div class="actions" style="margin-top:15px">${btn('Descargar CSV','export-csv','primary')}${btn('Imprimir / PDF','export-pdf')}</div><p class="small-note">Para obtener un PDF, utiliza «Guardar como PDF» en la ventana de impresión.</p><hr><div class="actions">${btn('Descargar copia JSON','backup-json','primary')}</div><p class="small-note">La copia JSON incluye todo: cuentas, movimientos, metas, presupuestos y ajustes.</p></section><section class="card">${cardHead('Restaurar datos')}<p class="muted">Carga una copia JSON anterior. Comprobaremos su estructura y te mostraremos un resumen antes de sustituir tus datos.</p>${btn('Elegir copia JSON','restore-json','ghost')}<p class="notice alert" style="margin-top:15px">Restaurar sustituye todos los datos del navegador. Guarda primero una copia de lo que tienes.</p></section></div>`;}
function viewAjustes(){return pageHead('Ajustes','Personaliza la aplicación y administra sus datos.')+
  `<div class="grid"><section class="card">${cardHead('Preferencias')}<div class="fields"><div class="field"><label for="settingCurrency">Moneda ${help('currency')}</label><select id="settingCurrency">${opts([{id:'EUR',name:'EUR · Euro (€)'},{id:'USD',name:'USD · Dólar ($)'},{id:'GBP',name:'GBP · Libra (£)'},{id:'CHF',name:'CHF · Franco suizo'},{id:'MXN',name:'MXN · Peso mexicano'}],db.settings.currency)}</select></div><div class="field"><label for="settingTheme">Apariencia ${help('theme')}</label><select id="settingTheme">${opts([{id:'dark',name:'Oscuro'},{id:'light',name:'Claro'}],db.settings.theme)}</select></div></div><p class="small-note">Cambiar la moneda no cambia el valor de los importes.</p></section>
  <section class="card">${cardHead('Mantenimiento')}<p>Guarda una copia antes de cambiar de navegador o dispositivo.</p><div class="actions">${btn('Descargar copia JSON','backup-json','primary')}${btn('Ver guía de uso','guide')}</div><hr><div class="actions">${btn('Borrar todos los datos','wipe-data','danger')}</div><p class="small-note">El borrado es irreversible si no tienes una copia JSON.</p></section></div>`;}
function render(){db=normalizeData(db);document.body.classList.toggle('light',db.settings.theme==='light');$('nav').innerHTML=pages.map(p=>`<button type="button" data-page="${e(p)}" class="${p===state.page?'active':''}" ${p===state.page?'aria-current="page"':''}>${e(p)}</button>`).join('');const views={Inicio:viewInicio,Movimientos:viewMovimientos,Cuentas:viewCuentas,'Categorías':viewCategorias,Presupuestos:viewPresupuestos,Recurrentes:viewRecurrentes,Metas:viewMetas,'Estadísticas':viewEstadisticas,Informes:viewInformes,Ajustes:viewAjustes};$('app').innerHTML=views[state.page]();if(state.page==='Movimientos')renderMovementResults();}
function field(name,label,control,helpKey){return `<div class="field"><label for="field-${e(name)}">${e(label)} ${help(helpKey||name)}</label>${control}</div>`;}
function textInput(name,val,required=true){return `<input id="field-${e(name)}" name="${e(name)}" value="${e(val??'')}" maxlength="140" ${required?'required':''}>`;}
function numberInput(name,val,min='0',step='0.01'){return `<input id="field-${e(name)}" name="${e(name)}" type="number" inputmode="decimal" min="${min}" step="${step}" value="${e(val??0)}" required>`;}
function dateInput(name,val){return `<input id="field-${e(name)}" name="${e(name)}" type="date" value="${e(val||isoDate())}" required>`;}
function selectInput(name,values,val){return `<select id="field-${e(name)}" name="${e(name)}" ${name==='category'?'':'required'}>${opts(values,val)}</select>`;}
function showForm(kind,id=null,template=null){
  let item=null;const isEdit=Boolean(id);if(kind==='transaction')item=db.transactions.find(x=>x.id===id);if(kind==='account')item=db.accounts.find(x=>x.id===id);if(kind==='budget')item=db.budgets.find(x=>x.id===id);if(kind==='recurring')item=db.recurring.find(x=>x.id===id);if(kind==='goal')item=db.goals.find(x=>x.id===id);if(kind==='category')item=db.categories.find(x=>x===id);if(kind==='contribution')item=db.goals.find(x=>x.id===id);
  if(isEdit&&!item)return alert('No se ha encontrado el registro.');
  const v=template||item||{};editContext={kind,id,type:v.type||'expense'};let title='',hint='',form='';
  if(kind==='transaction'){
    title=`${isEdit?'Editar':template?.duplicated?'Duplicar':'Nuevo'} ${typeLabels[v.type]||'movimiento'}`;
    const type=v.type||'expense';editContext.type=type;
    hint='La cantidad es siempre positiva. La operación suma, resta o traslada dinero según su tipo.';
    form=field('amount','Importe',numberInput('amount',v.amount||'', '0.01'))+
      field('date','Fecha',dateInput('date',template?isoDate():(v.date||isoDate())))+
      field('account',type==='transfer'?'Cuenta de origen':'Cuenta',selectInput('account',db.accounts,v.account||db.accounts[0].id));
    if(type==='transfer'){form+=field('to','Cuenta de destino',selectInput('to',db.accounts,v.to||db.accounts.find(a=>a.id!==v.account)?.id||db.accounts[0].id));}
    else {form+=field('category','Categoría',selectInput('category',[{id:'',name:'Sin categoría'},...db.categories.map(c=>({id:c,name:c}))],v.category||''));}
    form+=field('note','Concepto',textInput('note',v.note||'',false));
  } else if(kind==='account'){
    title=isEdit?'Editar cuenta':'Nueva cuenta';hint='El saldo inicial es el dinero que ya tenías antes de comenzar a registrar movimientos.';
    form=field('name','Nombre',textInput('name',v.name||''))+field('opening','Saldo inicial',numberInput('opening',v.opening??0,'-999999999.99'));
  } else if(kind==='category'){
    title=isEdit?'Editar categoría':'Nueva categoría';hint='El nombre se utilizará para clasificar movimientos y presupuestos.';
    form=field('name','Nombre',textInput('name',isEdit?item:''));
  } else if(kind==='budget'){
    title=isEdit?'Editar presupuesto':'Nuevo presupuesto';hint='Un límite por categoría, repetido cada mes.';
    form=field('category','Categoría',selectInput('category',db.categories,v.category||db.categories[0]))+field('limit','Límite mensual',numberInput('limit',v.limit||'', '0.01'),'budget-limit');
  } else if(kind==='recurring'){
    title=isEdit?'Editar movimiento recurrente':'Nuevo movimiento recurrente';hint='Cuando la aplicación se abre, registra los vencimientos de las reglas activas.';
    form=field('type','Tipo',selectInput('type',[{id:'expense',name:'Gasto'},{id:'income',name:'Ingreso'}],v.type||'expense'))+
      field('amount','Importe',numberInput('amount',v.amount||'','0.01'))+
      field('account','Cuenta',selectInput('account',db.accounts,v.account||db.accounts[0].id))+
      field('category','Categoría',selectInput('category',[{id:'',name:'Sin categoría'},...db.categories.map(c=>({id:c,name:c}))],v.category||''))+
      field('note','Concepto',textInput('note',v.note||'',false))+
      field('frequency','Periodicidad',selectInput('frequency',Object.entries(frequencyLabels).map(([id,name])=>({id,name})),v.frequency||'monthly'))+
      field('next','Próxima fecha',dateInput('next',v.next||isoDate()));
  } else if(kind==='goal'){
    title=isEdit?'Editar meta':'Nueva meta';hint='Los importes de las metas son informativos y no modifican las cuentas.';
    form=field('name','Nombre de la meta',textInput('name',v.name||''))+
      field('target','Cantidad objetivo',numberInput('target',v.target||'','0.01'))+
      field('saved','Cantidad ya ahorrada',numberInput('saved',v.saved||0));
  } else if(kind==='contribution'){
    title=`Aportar a ${item.name}`;hint='Esta aportación actualiza el progreso de tu meta, pero no modifica el saldo de ninguna cuenta.';
    form=field('amount','Importe a añadir',numberInput('amount','','0.01'))+field('date','Fecha',dateInput('date',isoDate()));
  }
  $('formTitle').textContent=title;$('formHint').textContent=hint;$('formFields').innerHTML=`<div class="fields">${form}</div>`;$('formDlg').showModal();const first=$('editForm').querySelector('input,select');first?.focus();
}
function submitForm(ev){ev.preventDefault();if(!editContext)return;const {kind,id,type}=editContext,f=new FormData($('editForm'));const val=k=>String(f.get(k)??'').trim();const amt=k=>cents(Number(val(k)));const change=(collection,obj)=>{if(id){const index=collection.findIndex(x=>x.id===id);if(index<0)throw Error('Registro no encontrado');collection[index]={...collection[index],...obj};}else collection.push({id:uuid(),...obj});};
  try{
    if(kind==='transaction'){
      const amount=amt('amount'),account=val('account'),to=val('to'),date=val('date');
      if(!(amount>0) || !db.accounts.some(a=>a.id===account) || !/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Introduce una cantidad positiva, fecha y cuenta válidas.');
      if(type==='transfer'&&(!db.accounts.some(a=>a.id===to)||to===account))throw Error('Selecciona dos cuentas diferentes para la transferencia.');
      change(db.transactions,{type,amount,date,account,to:type==='transfer'?to:undefined,category:type==='transfer'?'':val('category'),note:val('note')});
    } else if(kind==='account'){
      if(!val('name'))throw Error('Introduce un nombre.');
      change(db.accounts,{name:val('name'),opening:amt('opening')});
    } else if(kind==='category'){
      const old=id,newName=val('name');if(!newName)throw Error('Introduce un nombre.');if(db.categories.some(c=>c.toLowerCase()===newName.toLowerCase()&&c!==old))throw Error('Ya existe una categoría con ese nombre.');
      if(id){db.categories[db.categories.indexOf(id)]=newName;for(const t of db.transactions)if(t.category===old)t.category=newName;for(const b of db.budgets)if(b.category===old)b.category=newName;for(const r of db.recurring)if(r.category===old)r.category=newName;}
      else db.categories.push(newName);
    } else if(kind==='budget'){
      const cat=val('category'),limit=amt('limit');if(!db.categories.includes(cat)||!(limit>0))throw Error('Elige una categoría y un límite positivo.');
      if(db.budgets.some(b=>b.category===cat&&b.id!==id))throw Error('Ya existe un presupuesto para esa categoría. Edita el existente.');
      change(db.budgets,{category:cat,limit});
    } else if(kind==='recurring'){
      const amount=amt('amount'),account=val('account'),next=val('next');if(!(amount>0)||!db.accounts.some(a=>a.id===account)||!/^\d{4}-\d{2}-\d{2}$/.test(next))throw Error('Revisa importe, cuenta y fecha.');
      change(db.recurring,{type:val('type'),amount,account,category:val('category'),note:val('note'),frequency:val('frequency'),next,anchorDay:Number(next.slice(-2)),active:id?(db.recurring.find(r=>r.id===id)?.active!==false):true});
    } else if(kind==='goal'){
      const target=amt('target'),saved=amt('saved');if(!val('name')||!(target>0)||saved<0)throw Error('Indica un nombre, un objetivo positivo y un ahorro válido.');
      change(db.goals,{name:val('name'),target,saved,history:id?db.goals.find(g=>g.id===id)?.history||[]:[]});
    } else if(kind==='contribution'){
      const amount=amt('amount'),goal=db.goals.find(g=>g.id===id);if(!goal||!(amount>0))throw Error('Introduce una aportación positiva.');goal.saved=cents(num(goal.saved)+amount);goal.history.push({id:uuid(),amount,date:val('date')});
    }
    $('formDlg').close();editContext=null;persist();notify('Guardado correctamente');
  }catch(err){alert(err.message||'No se pudo guardar el registro.');}
}
function remove(kind,id){let items;switch(kind){case 'transaction':items=db.transactions;break;case 'account':items=db.accounts;break;case 'category':items=db.categories;break;case 'budget':items=db.budgets;break;case 'recurring':items=db.recurring;break;case 'goal':items=db.goals;break;default:return;}
  if(kind==='account'){
    if(db.accounts.length===1)return alert('Debe existir al menos una cuenta.');
    if(db.transactions.some(t=>t.account===id||t.to===id)||db.recurring.some(r=>r.account===id))return alert('No se puede eliminar esta cuenta porque tiene movimientos o reglas recurrentes.');
  }
  if(kind==='category'&&(db.transactions.some(t=>t.category===id)||db.budgets.some(b=>b.category===id)||db.recurring.some(r=>r.category===id)))return alert('Esta categoría se usa en movimientos, presupuestos o recurrentes. Cámbiala antes de eliminarla.');
  if(!confirm(`¿Eliminar ${kind==='recurring'?'la regla (los movimientos ya registrados se conservarán)':'este registro'}?`))return;
  if(kind==='category')db.categories=db.categories.filter(x=>x!==id);else{const index=items.findIndex(x=>x.id===id);if(index>=0)items.splice(index,1);}persist();notify('Registro eliminado');
}
function nextOccurrence(date,frequency,anchorDay){const d=new Date(date+'T12:00:00');if(Number.isNaN(d.getTime()))return null;
  if(frequency==='weekly')d.setDate(d.getDate()+7);
  else if(frequency==='yearly'){const yr=d.getFullYear()+1,mo=d.getMonth();d.setFullYear(yr,mo,Math.min(anchorDay||d.getDate(),new Date(yr,mo+1,0).getDate()));}
  else {const yr=d.getFullYear(),mo=d.getMonth()+1;d.setFullYear(yr,mo,Math.min(anchorDay||d.getDate(),new Date(yr,mo+1,0).getDate()));}
  return isoDate(d);
}
function processRecurring(){let changed=false,pending=false;const today=isoDate();for(const r of db.recurring){if(r.active===false)continue;let count=0;while(r.next && r.next<=today && count<120){if(!db.transactions.some(t=>t.recurringId===r.id&&t.date===r.next)){
    db.transactions.push({id:uuid(),recurringId:r.id,type:r.type,amount:num(r.amount),date:r.next,account:r.account,category:r.category||'',note:r.note||''});changed=true;
  }const next=nextOccurrence(r.next,r.frequency,r.anchorDay);if(!next||next<=r.next)break;r.next=next;changed=true;count++;}if(r.next<=today)pending=true;}
  if(changed){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(db));}catch{alert('No se pudieron guardar algunos movimientos recurrentes. Haz una copia de seguridad.');}}
  if(pending)setTimeout(()=>alert('Algunas reglas recurrentes tienen más de 120 vencimientos pendientes. Revisa sus fechas y abre de nuevo la aplicación si es necesario.'),200);
}
function download(name,content,mime){const blob=new Blob([content],{type:mime});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3500);}
function backup(){download(`MONEY_LOG_copia_${isoDate()}.json`,JSON.stringify({...db,exportedAt:new Date().toISOString()},null,2),'application/json;charset=utf-8');notify('Copia JSON descargada');}
function csvEscape(v){let s=String(v??'');if(/^[=+@\-]/.test(s)&&!/^\-?\d+([.,]\d+)?$/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
function exportCsv(){const rows=db.transactions.filter(t=>t.date.startsWith(state.reportMonth)).sort((a,b)=>a.date.localeCompare(b.date));const header=['Fecha','Tipo','Cuenta','Destino','Categoría','Concepto','Importe'];const data=rows.map(t=>[t.date,typeLabels[t.type]||t.type,accountName(t.account),t.to?accountName(t.to):'',t.category||'',t.note||'',cents(t.amount).toFixed(2).replace('.',',')]);download(`MONEY_LOG_${state.reportMonth}.csv`,'\ufeff'+[header,...data].map(row=>row.map(csvEscape).join(';')).join('\r\n'),'text/csv;charset=utf-8');notify('CSV descargado');}
function exportPdf(){const m=state.reportMonth,t=totals(m),rows=db.transactions.filter(t=>t.date.startsWith(m)).sort((a,b)=>a.date.localeCompare(b.date));const popup=window.open('','_blank');if(!popup)return alert('Permite ventanas emergentes para imprimir el informe.');const html=`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>MONEY LOG — Informe ${e(m)}</title><style>body{font:14px Arial,sans-serif;margin:32px;color:#142034}h1{margin-bottom:6px}p{color:#555}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{padding:8px 6px;text-align:left;border-bottom:1px solid #ddd}th{background:#eee}td:last-child{text-align:right}small{color:#666}</style></head><body><h1>MONEY LOG · ${e(m)}</h1><p>Ingresos: <b>${money(t.income)}</b> · Gastos: <b>${money(t.expense)}</b> · Ahorro: <b>${money(t.income-t.expense)}</b></p><table><thead><tr><th>Fecha</th><th>Tipo</th><th>Concepto</th><th>Categoría</th><th>Importe</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${e(fmtDate(x.date))}</td><td>${e(typeLabels[x.type])}</td><td>${e(x.note)}</td><td>${e(x.category)}</td><td>${money(x.amount)}</td></tr>`).join('')}</tbody></table><p><small>Informe generado localmente. MONEY LOG no envía datos a ningún servidor.</small></p><script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>`;popup.document.open();popup.document.write(html);popup.document.close();}
function validateBackup(data){if(!data||typeof data!=='object'||Array.isArray(data))throw Error('No es una copia válida.');for(const k of ['accounts','transactions','categories','budgets','recurring','goals'])if(!Array.isArray(data[k]))throw Error('Falta el apartado '+k+'.');if(!data.settings||typeof data.settings!=='object')throw Error('Faltan los ajustes.');if(!data.accounts.length)throw Error('La copia no contiene ninguna cuenta.');
  const seen=new Set();for(const a of data.accounts){if(typeof a.id!=='string'||typeof a.name!=='string'||!Number.isFinite(Number(a.opening))||seen.has(a.id))throw Error('Cuentas inválidas o repetidas.');seen.add(a.id);}
  for(const t of data.transactions){if(typeof t.id!=='string'||!['income','expense','transfer'].includes(t.type)||!(Number(t.amount)>0)||!Number.isFinite(Number(t.amount))||!/\d{4}-\d{2}-\d{2}/.test(t.date)||!seen.has(t.account)||t.type==='transfer'&&(!seen.has(t.to)||t.to===t.account))throw Error('Hay movimientos inválidos en la copia.');}
  for(const r of data.recurring){if(typeof r.id!=='string'||!['income','expense'].includes(r.type)||!(Number(r.amount)>0)||!seen.has(r.account)||!['weekly','monthly','yearly'].includes(r.frequency)||!/\d{4}-\d{2}-\d{2}/.test(r.next))throw Error('Hay movimientos recurrentes inválidos.');}
  for(const b of data.budgets){if(typeof b.id!=='string'||typeof b.category!=='string'||!(Number(b.limit)>0))throw Error('Hay presupuestos inválidos.');}
  for(const g of data.goals){if(typeof g.id!=='string'||typeof g.name!=='string'||!(Number(g.target)>0)||!(Number(g.saved)>=0))throw Error('Hay metas inválidas.');}
  if(!data.categories.every(c=>typeof c==='string'))throw Error('Hay categorías inválidas.');
  return data;
}
function setPage(page){if(!pages.includes(page))return;state.page=page;render();window.scrollTo({top:0,behavior:'instant'});}
function showHelp(key){const [title,copy]=HELP[key]||['Información',HELP[state.page]?.[1]||'Este apartado te ayuda a organizar tus finanzas.'];$('helpTitle').textContent=title;$('helpDesc').textContent=copy;$('helpDlg').showModal();}
function action(type){
  const [command,idEncoded='']=type.split(':');
  const id=command.endsWith('-category')?decodeURIComponent(idEncoded):idEncoded;
  if(command==='guide'){$('guideDlg').showModal();return;}
  if(command==='backup-json'){backup();return;}
  if(command==='export-csv'){exportCsv();return;}
  if(command==='export-pdf'){exportPdf();return;}
  if(command==='restore-json'){$('restoreFile').click();return;}
  if(command==='clear-filters'){Object.assign(state,{month:thisMonth(),query:'',type:'all',account:'all',category:'all'});render();return;}
  if(command==='wipe-data'){
    if(!confirm('¿Quieres borrar TODOS los datos locales de MONEY LOG? Descarga antes una copia JSON.'))return;
    if(!confirm('CONFIRMACIÓN FINAL: se borrarán cuentas, movimientos, metas, presupuestos y ajustes. ¿Continuar?'))return;
    db=newData();state.page='Inicio';persist();notify('Datos eliminados');return;
  }
  if(command.startsWith('go-')){setPage(command.slice(3));return;}
  if(command==='add-income'){showForm('transaction',null,{type:'income'});return;}
  if(command==='add-expense'){showForm('transaction',null,{type:'expense'});return;}
  if(command==='add-transfer'){showForm('transaction',null,{type:'transfer'});return;}
  if(command==='add-contribution'){showForm('contribution',id);return;}
  if(command.startsWith('add-')){showForm(command.slice(4));return;}
  if(command.startsWith('edit-')){showForm(command.slice(5),id);return;}
  if(command.startsWith('delete-')){remove(command.slice(7),id);return;}
  if(command==='duplicate-transaction'){
    const t=db.transactions.find(x=>x.id===id);
    if(t)showForm('transaction',null,{...t,id:undefined,date:isoDate(),duplicated:true});
    return;
  }
  if(command==='toggle-recurring'){
    const r=db.recurring.find(x=>x.id===id);
    if(!r)return;
    r.active=r.active===false;
    persist();notify(r.active?'Regla reactivada':'Regla pausada');return;
  }
}
document.addEventListener('click',ev=>{const h=ev.target.closest('[data-help]');if(h){showHelp(h.dataset.help);return;}const n=ev.target.closest('[data-page],[data-action]');if(!n)return;if(n.dataset.page){setPage(n.dataset.page);return;}if(n.dataset.action)action(n.dataset.action);});
document.addEventListener('input',ev=>{const id=ev.target.id;if(id==='f-query'){state.query=ev.target.value;renderMovementResults();}});
document.addEventListener('change',ev=>{const {id,value}=ev.target;const filters={'f-month':'month','f-type':'type','f-account':'account','f-category':'category'};if(filters[id]){state[filters[id]]=value;renderMovementResults();}else if(id==='reportMonth')state.reportMonth=value;else if(id==='settingCurrency'){db.settings.currency=value;persist();}else if(id==='settingTheme'){db.settings.theme=value;persist();}});
$('editForm').addEventListener('submit',submitForm);
for(const id of ['formClose','formCancel'])$(id).onclick=()=>{$('formDlg').close();editContext=null;};
for(const id of ['helpClose','helpOkay'])$(id).onclick=()=>$('helpDlg').close();
for(const id of ['guideClose','guideOkay'])$(id).onclick=()=>$('guideDlg').close();
$('guideBtn').onclick=()=>$('guideDlg').showModal();
$('themeBtn').onclick=()=>{db.settings.theme=db.settings.theme==='dark'?'light':'dark';persist();};
$('restoreFile').addEventListener('change',async ev=>{const file=ev.target.files?.[0];if(!file)return;try{if(file.size>20*1024*1024)throw Error('El archivo supera los 20 MB.');const data=validateBackup(JSON.parse(await file.text()));const msg=`La copia contiene ${data.accounts.length} cuenta(s), ${data.transactions.length} movimiento(s), ${data.budgets.length} presupuesto(s) y ${data.goals.length} meta(s).\n\nATENCIÓN: se sustituirán TODOS los datos actuales. ¿Restaurar?`;if(!confirm(msg))return;db=normalizeData(data);persist();notify('Copia restaurada correctamente');}catch(err){alert('No se pudo restaurar: '+err.message);}finally{ev.target.value='';}});
processRecurring();render();
if('serviceWorker' in navigator && location.protocol.startsWith('http')){
  const hadController=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(reg=>{
    reg.update().catch(()=>{});
    if(hadController){let reloaded=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloaded)return;reloaded=true;location.reload();});}
  }).catch(()=>{});
}
