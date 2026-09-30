(() => {
  'use strict';

  const STORAGE_KEY = 'theEightyStateV1';
  const START = '2026-10-01';
  const END = '2026-10-31';
  const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const REASONS = ['Work ran late','Low energy','Family responsibility','Forgot','Goal felt too hard','Outside my control'];

  const DEFAULT_GOALS = [
    {id:'personal',category:'Personal',name:'Intentional present time',target:'20 minutes present and intentional',minimum:'10 minutes fully present',days:[0,1,2,3,4,5,6],active:true},
    {id:'professional',category:'Professional',name:'Top 3 + shutdown routine',target:'Set Top 3 and complete shutdown routine',minimum:'Write tomorrow’s #1 priority',days:[1,2,3,4,5],active:true},
    {id:'spiritual',category:'Spiritual',name:'Spiritual connection',target:'10 minutes prayer, Bible, devotional, or reflection',minimum:'2 minutes prayer or reflection',days:[0,1,2,3,4,5,6],active:true},
    {id:'fitness',category:'Fitness',name:'Intentional movement',target:'30+ minutes planned movement / workout',minimum:'10-minute purposeful walk',days:[0,1,2,3,4,5,6],active:true},
    {id:'mental',category:'Mental',name:'Mental reset',target:'10 minutes quiet reset / journaling / no-phone time',minimum:'2 minutes quiet reset',days:[0,1,2,3,4,5,6],active:true}
  ];

  const DEFAULT_STATE = {
    version:1,
    challenge:{mileGoal:100,start:START,end:END},
    goals:DEFAULT_GOALS,
    daily:{},
    weeklyReviews:{},
    selectedDate:START,
    pathMode:'path'
  };

  let state = loadState();
  normalizeState();

  const $ = (s,root=document) => root.querySelector(s);
  const $$ = (s,root=document) => [...root.querySelectorAll(s)];

  const screens = $$('.screen');
  const navButtons = $$('.nav-btn');

  function deepClone(obj){ return JSON.parse(JSON.stringify(obj)); }
  function loadState(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return deepClone(DEFAULT_STATE);
      const parsed = JSON.parse(raw);
      return parsed && parsed.version === 1 ? parsed : deepClone(DEFAULT_STATE);
    }catch(e){ return deepClone(DEFAULT_STATE); }
  }
  function normalizeState(){
    state.challenge ||= deepClone(DEFAULT_STATE.challenge);
    state.goals ||= deepClone(DEFAULT_GOALS);
    state.daily ||= {};
    state.weeklyReviews ||= {};
    state.selectedDate ||= START;
    state.pathMode ||= 'path';
    state.goals.forEach((g,i)=>{
      g.id ||= DEFAULT_GOALS[i]?.id || `goal-${i}`;
      g.category ||= DEFAULT_GOALS[i]?.category || `Category ${i+1}`;
      g.name ||= 'Goal'; g.target ||= ''; g.minimum ||= '';
      if(!Array.isArray(g.days)) g.days=[0,1,2,3,4,5,6];
      if(typeof g.active !== 'boolean') g.active=true;
    });
    state.selectedDate = clampDate(state.selectedDate);
    saveState(false);
  }
  function saveState(show=true){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if(show) toast('Saved');
  }
  function clampDate(date){ return date < START ? START : date > END ? END : date; }
  function parseDate(date){ const [y,m,d]=date.split('-').map(Number); return new Date(Date.UTC(y,m-1,d)); }
  function formatDate(date){ return parseDate(date).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',timeZone:'UTC'}); }
  function addDays(date,n){ const d=parseDate(date); d.setUTCDate(d.getUTCDate()+n); return d.toISOString().slice(0,10); }
  function dayNumber(date){ return parseDate(date).getUTCDate(); }
  function daysBetween(a,b){ return Math.floor((parseDate(b)-parseDate(a))/86400000); }
  function todayISO(){ return new Date().toISOString().slice(0,10); }
  function scoringEndDate(){ const t=todayISO(); if(t<START) return null; return t>END?END:t; }
  function dataFor(date){
    if(!state.daily[date]) state.daily[date]={miles:0,tasks:{},reasons:[],note:''};
    return state.daily[date];
  }
  function isScheduled(goal,date){ return goal.active && goal.days.includes(parseDate(date).getUTCDay()); }
  function statusPoints(status){ return status==='target'?1:status==='minimum'?.8:0; }
  function colorForScore(score){
    if(score == null) return '#cbd5e1';
    if(score===100) return '#84cc16';
    if(score>=80) return '#16a34a';
    if(score>=65) return '#eab308';
    if(score>=51) return '#f97316';
    return '#dc2626';
  }
  function classForScore(score){
    if(score == null) return '';
    if(score===100) return 'score-perfect';
    if(score>=80) return 'score-green';
    if(score>=65) return 'score-yellow';
    if(score>=51) return 'score-orange';
    return 'score-red';
  }
  function labelForScore(score){
    if(score == null) return 'Ready';
    if(score===100) return 'Perfect';
    if(score>=80) return 'Consistently Successful';
    if(score>=65) return 'Close — Find the WHY';
    if(score>=51) return 'Needs Attention';
    return 'Inconsistent — Reset & Return';
  }

  function dayScore(date, categoryId=null){
    const goals = state.goals.filter(g => isScheduled(g,date) && (!categoryId || g.id===categoryId));
    if(!goals.length) return null;
    let earned=0, possible=0;
    for(const g of goals){
      const status = dataFor(date).tasks[g.id]?.status || 'none';
      if(status==='outside') continue;
      possible += 1;
      earned += statusPoints(status);
    }
    return possible ? Math.round((earned/possible)*100) : null;
  }

  function categoryScore(goalId, endDate=scoringEndDate(), simulated=null){
    if(!endDate) return null;
    let earned=0, possible=0;
    for(let d=START; d<=endDate; d=addDays(d,1)){
      const goal = state.goals.find(g=>g.id===goalId);
      if(!goal || !isScheduled(goal,d)) continue;
      let status = simulated?.[d]?.[goalId] ?? state.daily[d]?.tasks?.[goalId]?.status ?? 'none';
      if(status==='outside') continue;
      possible += 1; earned += statusPoints(status);
    }
    return possible ? Math.round((earned/possible)*100) : null;
  }

  function overallScore(endDate=scoringEndDate(), simulated=null){
    const scores=state.goals.filter(g=>g.active).map(g=>categoryScore(g.id,endDate,simulated)).filter(v=>v!=null);
    return scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : null;
  }

  function totalMiles(endDate=END){
    let total=0;
    Object.entries(state.daily).forEach(([date,v])=>{ if(date>=START && date<=endDate) total += Number(v.miles)||0; });
    return Math.round(total*10)/10;
  }
  function paceInfo(){
    const scoreEnd=scoringEndDate();
    const total=totalMiles(scoreEnd || END);
    if(!scoreEnd) return {text:'Starts Oct 1',delta:0,needed:100/31};
    const elapsed=daysBetween(START,scoreEnd)+1;
    const expected=100*(elapsed/31);
    const delta=total-expected;
    const remainingDays=31-elapsed;
    const needed=remainingDays>0?Math.max(0,(100-total)/remainingDays):Math.max(0,100-total);
    return {text:Math.abs(delta)<.25?'On pace':delta>0?`${delta.toFixed(1)} mi ahead`:`${Math.abs(delta).toFixed(1)} mi behind`,delta,needed};
  }

  function navigate(screen){
    screens.forEach(s=>s.classList.toggle('active',s.dataset.screen===screen));
    navButtons.forEach(b=>b.classList.toggle('active',b.dataset.nav===screen));
    window.scrollTo({top:0,behavior:'smooth'});
    if(screen==='path') renderPath();
    if(screen==='progress') renderProgress();
    if(screen==='review') renderReview();
    if(screen==='goals') renderGoals();
  }

  function renderAll(){ renderHeader(); renderHome(); renderPath(); renderProgress(); renderReview(); }

  function renderHeader(){
    const day=dayNumber(state.selectedDate);
    $('#dayNumberLabel').textContent=`DAY ${day} OF 31`;
    $('#selectedDateLabel').textContent=formatDate(state.selectedDate);
    $('#prevDateBtn').disabled=state.selectedDate===START;
    $('#nextDateBtn').disabled=state.selectedDate===END;
  }

  function renderHome(){
    const overall=overallScore();
    const scoreVal=$('#overallScoreValue');
    scoreVal.className=''; scoreVal.textContent=overall==null?'—':`${overall}%`;
    $('#overallScoreLabel').textContent=labelForScore(overall);
    $('#overallBar').style.width=`${overall||0}%`;

    const todayScore=dayScore(state.selectedDate);
    const chip=$('#todayScoreChip');
    chip.textContent=`Today ${todayScore==null?'—':todayScore+'%'}`;
    chip.className=`status-chip ${classForScore(todayScore)}`;

    const ringWrap=$('#categoryRings'); ringWrap.innerHTML='';
    state.goals.filter(g=>g.active).forEach(g=>{
      const score=categoryScore(g.id);
      const card=document.createElement('div'); card.className='mini-ring-card';
      card.innerHTML=`<div class="mini-ring" style="--p:${score||0};--c:${colorForScore(score)}"><strong>${score==null?'—':score+'%'}</strong></div><b>${escapeHtml(g.category)}</b><small class="${classForScore(score)}">${escapeHtml(shortLabel(score))}</small>`;
      ringWrap.appendChild(card);
    });

    const total=totalMiles(END);
    const remaining=Math.max(0,100-total);
    const pace=paceInfo();
    $('#milesTotal').textContent=total.toFixed(1);
    $('#milesRemaining').textContent=`${remaining.toFixed(1)} mi`;
    $('#milesPace').textContent=`${pace.needed.toFixed(2)}/day`;
    $('#paceStatus').textContent=pace.text;
    $('#milesProgress').style.width=`${Math.min(100,total)}%`;
    $('#milesInput').value=dataFor(state.selectedDate).miles||'';

    renderDailyTasks();
  }

  function shortLabel(score){
    if(score==null) return 'Ready';
    if(score===100) return 'Perfect';
    if(score>=80) return 'Successful';
    if(score>=65) return 'Close';
    if(score>=51) return 'Improve';
    return 'Reset';
  }

  function renderDailyTasks(){
    const wrap=$('#dailyTasks'); wrap.innerHTML='';
    const goals=state.goals.filter(g=>isScheduled(g,state.selectedDate));
    if(!goals.length){ wrap.innerHTML='<div class="empty-state">No goals are scheduled for this day. Use Goals to change the schedule.</div>'; $('#todaySummary').textContent='Recovery day — nothing scheduled.'; return; }
    const day=dataFor(state.selectedDate);
    goals.forEach(g=>{
      const st=day.tasks[g.id]?.status||'none';
      const row=document.createElement('div'); row.className='task-row';
      row.innerHTML=`<div class="task-top"><div><div class="task-category">${escapeHtml(g.category)}</div><div class="task-name">${escapeHtml(g.name)}</div><div class="task-target">Target: ${escapeHtml(g.target)} · Minimum: ${escapeHtml(g.minimum)}</div></div></div>
      <div class="task-status-buttons">
        <button class="task-state ${st==='target'?'active-target':''}" data-goal="${g.id}" data-status="target">✓ Target</button>
        <button class="task-state ${st==='minimum'?'active-minimum':''}" data-goal="${g.id}" data-status="minimum">+ Minimum</button>
        <button class="task-state ${st==='outside'?'active-outside':''}" data-goal="${g.id}" data-status="outside">Ⅱ Outside Control</button>
      </div>`;
      wrap.appendChild(row);
    });
    $$('.task-state',wrap).forEach(btn=>btn.addEventListener('click',()=>{
      const goalId=btn.dataset.goal, status=btn.dataset.status;
      const current=day.tasks[goalId]?.status||'none';
      day.tasks[goalId]={status:current===status?'none':status};
      saveState(false); renderAll();
    }));
    const score=dayScore(state.selectedDate);
    const summary=$('#todaySummary');
    if(score==null) summary.textContent='Nothing is currently counted toward today.';
    else if(score===100) summary.innerHTML='<strong>100% — Perfect Day.</strong> Every scheduled commitment hit the target.';
    else if(score>=80) summary.innerHTML=`<strong>${score}% — Consistently Successful.</strong> You are above The Eighty.`;
    else if(score>=51) summary.innerHTML=`<strong>${score}% — Needs attention.</strong> Use THE PATH to find the next realistic action.`;
    else summary.innerHTML=`<strong>${score}% — Inconsistent today.</strong> No shame. Choose a Minimum Win or reset clean tomorrow.`;
  }

  function renderPath(){
    const mode=state.pathMode||'path';
    $$('.mode-card').forEach(b=>{ const on=b.dataset.mode===mode; b.classList.toggle('selected',on); b.setAttribute('aria-pressed',String(on)); });
    const plan=buildPathPlan(mode);
    $('#pathPlanTitle').textContent=plan.title;
    $('#pathTimeChip').textContent=plan.time;
    $('#pathPlanSummary').textContent=plan.summary;
    const list=$('#pathActionList'); list.innerHTML='';
    plan.actions.forEach(a=>{
      const label=document.createElement('label'); label.className='path-action';
      label.innerHTML=`<input type="checkbox"><span><strong>${escapeHtml(a.title)}</strong><small>${escapeHtml(a.detail)}</small></span>`;
      list.appendChild(label);
    });
    $('#pathProjection').textContent=plan.projection;
    const day=dataFor(state.selectedDate);
    renderReasons($('#reasonGrid'),day.reasons,reasons=>{day.reasons=reasons; saveState(false);});
    $('#dailyNote').value=day.note||'';
  }

  function buildPathPlan(mode){
    const date=state.selectedDate;
    const current=overallScore() ?? 0;
    const day=dataFor(date);
    const scheduled=state.goals.filter(g=>isScheduled(g,date));
    const incomplete=scheduled.filter(g=>!['target','outside'].includes(day.tasks[g.id]?.status||'none'));
    const lagging=[...state.goals].filter(g=>g.active).map(g=>({g,score:categoryScore(g.id)??0})).sort((a,b)=>a.score-b.score);
    const pace=paceInfo();
    const actions=[];
    let projected=current;

    if(mode==='beyond'){
      const miles=Math.min(8, Math.max(4, pace.delta<0 ? Math.abs(pace.delta)+3.2 : 4.5));
      actions.push({title:`${miles.toFixed(1)}-mile walk/run`,detail:pace.delta<0?'Catch up meaningful mileage and move back toward monthly pace.':'Bank mileage while energy is high.'});
      lagging.slice(0,2).forEach(({g,score})=>actions.push({title:g.target,detail:`Push ${g.category} beyond its current ${score}% consistency.`}));
      const extra=state.goals.find(g=>g.id==='fitness'); if(extra) actions.push({title:'Optional movement session',detail:'Strength or pickleball can add movement without affecting the 100-mile total.'});
      projected=simulateProjected(date,incomplete.slice(0,3),'target');
      return {title:'Go Beyond',time:'~60–90 min',summary:'You have capacity today. Use it to gain ground without making tomorrow harder.',actions,projection:`Projected consistency: ${projected||current}%${projected>=80?' · Above The Eighty.':' · Meaningful progress toward The Eighty.'}`};
    }

    if(mode==='protect'){
      const candidates=incomplete.sort((a,b)=>(categoryScore(a.id)??0)-(categoryScore(b.id)??0)).slice(0,3);
      candidates.forEach(g=>actions.push({title:g.minimum,detail:`Minimum Win for ${g.category}. Keep the habit alive.`}));
      if(pace.delta<0) actions.unshift({title:'10-minute purposeful walk',detail:'A small mileage contribution. No catch-up debt today.'});
      projected=simulateProjected(date,candidates,'minimum');
      return {title:'Protect the Habit',time:'~10–20 min',summary:'Today is about staying connected to the habits, not recovering the entire month.',actions:actions.slice(0,4),projection:`Projected consistency: ${projected||current}% · Momentum protected. Reassess tomorrow.`};
    }

    // Show Me The Path: simulate the highest-impact unfinished targets until reaching 80 or exhausting today.
    const ordered=incomplete.sort((a,b)=>(categoryScore(a.id)??0)-(categoryScore(b.id)??0));
    const picked=[];
    let sim={};
    for(const g of ordered){
      picked.push(g);
      sim=simulationFor(date,picked,'target');
      projected=overallScore(scoringEndDate()||date,sim) ?? current;
      if(projected>=80) break;
    }
    if(pace.delta<0){
      const miles=Math.min(5,Math.max(2,pace.needed));
      actions.push({title:`${miles.toFixed(1)}-mile walk/run`,detail:`You are ${Math.abs(pace.delta).toFixed(1)} miles behind pace. This narrows the gap without trying to erase it all today.`});
    } else {
      actions.push({title:`${Math.max(2,pace.needed).toFixed(1)}-mile walk/run`,detail:'Stay on monthly mileage pace.'});
    }
    picked.forEach(g=>actions.push({title:g.target,detail:`Targets ${g.category}, currently ${categoryScore(g.id)??0}%.`}));
    if(!picked.length) actions.push({title:'Keep today simple',detail:'Your scheduled commitments are already protected. Maintain the 80 instead of inventing extra work.'});
    return {title:'Show Me The Path',time:'~20–40 min',summary:current>=80?'You are already above The Eighty. Protect the line with the smallest useful actions.':`Current consistency is ${current}%. This is the shortest realistic path available today.`,actions:actions.slice(0,4),projection:`Projected consistency: ${projected||current}%${(projected||current)>=80?' · Back above The Eighty.':' · Keep stacking wins; the line is getting closer.'}`};
  }

  function simulationFor(date,goals,status){
    const sim={}; sim[date]={}; goals.forEach(g=>sim[date][g.id]=status); return sim;
  }
  function simulateProjected(date,goals,status){ return overallScore(scoringEndDate()||date,simulationFor(date,goals,status)) ?? 0; }

  function renderProgress(){
    const score=overallScore();
    const ring=$('#bigScoreRing'); ring.style.setProperty('--p',score||0); ring.style.setProperty('--c',colorForScore(score));
    $('#bigScoreValue').textContent=score==null?'—':`${score}%`;
    $('#bigScoreLabel').textContent=labelForScore(score);
    const bars=$('#categoryBars'); bars.innerHTML='';
    state.goals.filter(g=>g.active).forEach(g=>{
      const s=categoryScore(g.id);
      const row=document.createElement('div'); row.className='category-bar-row';
      row.innerHTML=`<div class="category-bar-head"><span>${escapeHtml(g.category)}</span><strong class="${classForScore(s)}">${s==null?'—':s+'%'}</strong></div><div class="category-bar-track"><div class="category-bar-fill" style="width:${s||0}%;background:${colorForScore(s)}"></div></div>`;
      bars.appendChild(row);
    });
    renderCalendar();
  }

  function renderCalendar(){
    const grid=$('#calendarGrid'); grid.innerHTML='';
    const firstDow=parseDate(START).getUTCDay();
    for(let i=0;i<firstDow;i++){const b=document.createElement('div');b.className='calendar-day blank';grid.appendChild(b);}
    const endScore=scoringEndDate();
    for(let day=1;day<=31;day++){
      const date=`2026-10-${String(day).padStart(2,'0')}`;
      const el=document.createElement('button'); el.className='calendar-day'; el.textContent=day;
      if(date===state.selectedDate) el.classList.add('selected');
      if(!endScore || date>endScore){el.classList.add('future');}
      else{
        const s=dayScore(date);
        if(s===100)el.classList.add('score-bg-perfect'); else if(s>=80)el.classList.add('score-bg-green'); else if(s>=65)el.classList.add('score-bg-yellow'); else if(s>=51)el.classList.add('score-bg-orange'); else el.classList.add('score-bg-red');
      }
      el.addEventListener('click',()=>{state.selectedDate=date;saveState(false);renderAll();navigate('home');});
      grid.appendChild(el);
    }
  }

  function weekNumber(date){ return Math.min(5,Math.floor((dayNumber(date)-1)/7)+1); }
  function weekRange(n){ const s=addDays(START,(n-1)*7); const e=n===5?END:addDays(s,6); return [s,e]; }
  function weekScore(n){
    const [s,e]=weekRange(n); let earned=0,possible=0;
    for(let d=s;d<=e;d=addDays(d,1)){
      if(scoringEndDate() && d>scoringEndDate()) break;
      state.goals.filter(g=>isScheduled(g,d)).forEach(g=>{const st=state.daily[d]?.tasks?.[g.id]?.status||'none';if(st==='outside')return;possible++;earned+=statusPoints(st);});
    }
    return possible?Math.round(earned/possible*100):null;
  }

  function renderReview(){
    const w=weekNumber(state.selectedDate); const key=`week-${w}`; const review=state.weeklyReviews[key]||{reasons:[],adjustment:''};
    $('#reviewWeekLabel').textContent=`WEEK ${w}`;
    const score=weekScore(w), chip=$('#reviewScoreChip'); chip.textContent=score==null?'—':`${score}% · ${shortLabel(score)}`; chip.className=`status-chip ${classForScore(score)}`;
    renderReasons($('#weeklyReasonGrid'),review.reasons,reasons=>{review.reasons=reasons;state.weeklyReviews[key]=review;saveState(false);});
    $('#weeklyAdjustment').value=review.adjustment||'';
    const common=mostCommonReason();
    $('#reviewCoachingText').textContent=common?`Your most common barrier so far is “${common}.” THE PATH can use that context to choose a smaller or more aggressive next move.`:'Choose your capacity and let THE PATH turn the lesson into a next action.';
  }

  function mostCommonReason(){
    const counts={};
    Object.values(state.daily).forEach(d=>(d.reasons||[]).forEach(r=>counts[r]=(counts[r]||0)+1));
    Object.values(state.weeklyReviews).forEach(w=>(w.reasons||[]).forEach(r=>counts[r]=(counts[r]||0)+1));
    return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0]||null;
  }

  function renderReasons(container,selected,onChange){
    container.innerHTML=''; REASONS.forEach(r=>{
      const label=document.createElement('label'); label.className='reason-chip';
      const input=document.createElement('input'); input.type='checkbox'; input.checked=selected.includes(r); input.value=r;
      const span=document.createElement('span'); span.textContent=r; label.append(input,span); container.appendChild(label);
      input.addEventListener('change',()=>{const values=$$('input:checked',container).map(i=>i.value);onChange(values);});
    });
  }

  function renderGoals(){
    const wrap=$('#goalEditors'); wrap.innerHTML='';
    state.goals.forEach(g=>{
      const details=document.createElement('details'); details.className='goal-editor';
      details.innerHTML=`<summary><div><div class="goal-editor-title">${escapeHtml(g.category)}</div><div class="goal-editor-sub">${escapeHtml(g.name)}</div></div><span>›</span></summary>
      <div class="goal-form">
        <div class="goal-form-grid">
          <label>Goal name<input type="text" data-field="name" value="${escapeAttr(g.name)}"></label>
          <label>Target<input type="text" data-field="target" value="${escapeAttr(g.target)}"></label>
          <label>Minimum Win<input type="text" data-field="minimum" value="${escapeAttr(g.minimum)}"></label>
        </div>
        <label class="field-label" style="margin-top:12px">Scheduled days</label>
        <div class="weekday-grid">${WEEKDAYS.map((d,i)=>`<label class="weekday-toggle"><span>${d.charAt(0)}</span><input type="checkbox" data-day="${i}" ${g.days.includes(i)?'checked':''}></label>`).join('')}</div>
        <div class="active-row"><span><strong>Goal active</strong><div class="helper">Inactive goals are excluded from scoring.</div></span><input type="checkbox" data-field="active" ${g.active?'checked':''}></div>
        <button class="btn btn-primary full save-goal-btn" data-id="${g.id}">Save ${escapeHtml(g.category)} goal</button>
      </div>`;
      wrap.appendChild(details);
    });
    $$('.save-goal-btn',wrap).forEach(btn=>btn.addEventListener('click',()=>{
      const goal=state.goals.find(g=>g.id===btn.dataset.id); const details=btn.closest('.goal-editor');
      goal.name=$('[data-field="name"]',details).value.trim()||goal.name;
      goal.target=$('[data-field="target"]',details).value.trim()||goal.target;
      goal.minimum=$('[data-field="minimum"]',details).value.trim()||goal.minimum;
      goal.active=$('[data-field="active"]',details).checked;
      goal.days=$$('[data-day]',details).filter(x=>x.checked).map(x=>Number(x.dataset.day));
      saveState(); renderAll(); renderGoals();
    }));
  }

  function exportBackup(){
    const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); const a=document.createElement('a');
    a.href=URL.createObjectURL(blob); a.download='the-eighty-backup.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),500);
  }
  function importBackup(file){
    const reader=new FileReader(); reader.onload=()=>{try{const parsed=JSON.parse(reader.result);if(!parsed||parsed.version!==1)throw new Error('Invalid backup');state=parsed;normalizeState();renderAll();renderGoals();toast('Backup imported');}catch(e){toast('Could not import that backup');}}; reader.readAsText(file);
  }
  function importCsv(file){
    const reader=new FileReader(); reader.onload=()=>{let count=0;const lines=String(reader.result).split(/\r?\n/);lines.forEach((line,idx)=>{if(!line.trim())return;const [dateRaw,milesRaw]=line.split(',').map(s=>s.trim());if(idx===0 && /date/i.test(dateRaw))return;const miles=Number(milesRaw);if(/^2026-10-\d{2}$/.test(dateRaw)&&Number.isFinite(miles)&&miles>=0){dataFor(dateRaw).miles=miles;count++;}});saveState(false);renderAll();toast(`${count} mileage entr${count===1?'y':'ies'} imported`);};reader.readAsText(file);
  }

  function toast(message){
    const t=$('#toast'); t.textContent=message; t.classList.add('show'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>t.classList.remove('show'),1800);
  }
  function escapeHtml(str){return String(str).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));}
  function escapeAttr(str){return escapeHtml(str).replace(/'/g,'&#39;');}

  navButtons.forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.nav)));
  $('#brandHomeBtn').addEventListener('click',()=>navigate('home'));
  $('#jumpGoalsBtn').addEventListener('click',()=>navigate('goals'));
  $('#reviewToPathBtn').addEventListener('click',()=>{state.pathMode='path';saveState(false);navigate('path');});
  $('#prevDateBtn').addEventListener('click',()=>{state.selectedDate=clampDate(addDays(state.selectedDate,-1));saveState(false);renderAll();});
  $('#nextDateBtn').addEventListener('click',()=>{state.selectedDate=clampDate(addDays(state.selectedDate,1));saveState(false);renderAll();});
  $('#saveMilesBtn').addEventListener('click',()=>{const val=Math.max(0,Math.min(50,Number($('#milesInput').value)||0));dataFor(state.selectedDate).miles=Math.round(val*10)/10;saveState();renderAll();});
  $$('.mode-card').forEach(b=>b.addEventListener('click',()=>{state.pathMode=b.dataset.mode;saveState(false);renderPath();}));
  $('#saveContextBtn').addEventListener('click',()=>{dataFor(state.selectedDate).note=$('#dailyNote').value.trim();saveState();});
  $('#saveReviewBtn').addEventListener('click',()=>{const w=weekNumber(state.selectedDate),key=`week-${w}`;const review=state.weeklyReviews[key]||{reasons:[],adjustment:''};review.adjustment=$('#weeklyAdjustment').value.trim();state.weeklyReviews[key]=review;saveState();renderReview();});
  $('#exportBtn').addEventListener('click',exportBackup);
  $('#importInput').addEventListener('change',e=>{const f=e.target.files?.[0];if(f)importBackup(f);e.target.value='';});
  $('#csvInput').addEventListener('change',e=>{const f=e.target.files?.[0];if(f)importCsv(f);e.target.value='';});

  renderAll(); renderGoals();

  if('serviceWorker' in navigator && location.protocol.startsWith('http')){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
  }
})();
