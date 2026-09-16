const STORAGE_KEY='totto-blog-assistant-v3';
const $=id=>document.getElementById(id), pid=n=>`step${n}-prompt`, aid=n=>`step${n}-answer`;
const val=n=>$(aid(n))?.value.trim()||'';
let articleTheme='';
const themeError='現在の記事テーマと本文HTMLの内容が違う可能性があります。今回作成した本文HTMLをSTEP3回答欄に貼り付けてください。';
const steps=[['キーワード・検索ニーズ作成','キーワード候補5つと、検索ニーズ10個を一度に作成します。'],['見出し構成作成','STEP1の回答をもとに、記事の見出し構成を作成します。'],['本文HTML作成','STEP1・STEP2の回答をもとに、本文HTMLを作成します。'],['メタディスクリプション・タグ作成','本文HTMLをもとに、メタディスクリプションとWordPress用タグを作成します。'],['画像作成','アイキャッチ画像1枚と、H2下画像3枚を作成します。画像を作成したら、WordPressのメディアへ手動で追加してください。その後、取得した画像URLをSTEP6に入力します。']];
function h2s(html){return [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].map(x=>x[1].replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim()).filter(x=>x&&x!=='まとめ');}
function articleError(forImages=false){const a=val(3),t=$('theme').value.trim();if(!a)return 'STEP3でChatGPTから返ってきた本文HTMLを先に貼り付けてください。';if(!/<article\b[^>]*>/i.test(a))return 'STEP3回答欄には、<article>から始まる本文HTMLを貼り付けてください。';if(articleTheme&&t&&articleTheme!==t)return themeError;const words=t.replace(/[「」『』、】【・]/g,' ').split(/[\s　とがのはにを関係]/).filter(x=>x.length>=2);if(words.length&&!words.some(x=>a.includes(x)))return themeError;if(forImages){const headings=h2s(a);if(headings.length<3)return 'STEP3回答欄には、「まとめ」以外のH2見出しが3つ以上必要です。';}return '';}
function warn(n,s){$(`warning-${n}`).textContent=s;}
function render(){const flow=steps.map(([name,desc],i)=>{const n=i+1,label=n===1?'ChatGPTから返ってきた「キーワード候補・検索ニーズ」を貼り付ける欄':'ChatGPTの回答を貼り付ける欄';return `<details class="step" ${n===1?'open':''} id="step-${n}"><summary><span class="step-number">STEP ${n}</span><strong class="step-title">${name}</strong><span class="step-status" id="status-${n}">状態：未作成</span></summary><div class="step-body"><p class="hint">${desc}</p><p id="warning-${n}" class="step-warning" aria-live="polite"></p><div class="prompt-field"><label>ChatGPTに貼り付けるプロンプト<textarea class="prompt-textarea" id="${pid(n)}" readonly></textarea></label><button type="button" class="copy-button" data-copy="${pid(n)}" data-message="copy-message-${n}">このプロンプトをコピー</button><p class="field-message" id="copy-message-${n}" aria-live="polite"></p></div><div class="answer-field"><label>${label}<textarea class="answer-textarea" id="${aid(n)}" data-save="answer" placeholder="ChatGPTの回答をここに貼り付け"></textarea></label><p class="field-message" id="answer-message-${n}" aria-live="polite"></p></div></div></details>`;}).join('');$('workflow').innerHTML=flow+`<details class="step" id="step-6"><summary><span class="step-number">STEP 6</span><strong class="step-title">画像URL挿入・完成HTML作成</strong><span class="step-status" id="status-6">状態：未作成</span></summary><div class="step-body"><p class="hint">WordPressメディアの画像URLを入れて完成HTMLを作成します。画像の挿入先はSTEP3のH2から自動表示されます。</p><p id="warning-6" class="step-warning" aria-live="polite"></p><div id="imageUrlFields"></div><button type="button" class="primary" id="insertImages">画像URLを挿入して完成HTMLを作成</button><p class="field-message" id="final-message" aria-live="polite"></p><label>完成HTML<textarea class="large-textarea" id="finalHtml" readonly wrap="soft"></textarea></label><button type="button" class="copy-button" id="copyFinal" data-message="final-message">完成HTMLをコピー</button></div></details>`;}
function set(n,text,error=''){warn(n,error);$(pid(n)).value=error?'':text;}
function urlsComplete(){return ['h2Image1','h2Image2','h2Image3'].every(id=>$(id)?.value.trim());}
function setStatus(n,done,label){const status=$(`status-${n}`);if(!status)return;status.textContent=`状態：${label||(done?'回答貼り付け済み':'未作成')}`;status.classList.toggle('is-done',done);}
function updateStatuses(){for(let n=1;n<=5;n++)setStatus(n,!!val(n));const complete=!!$('finalHtml')?.value.trim();setStatus(6,complete,complete?'完成HTML作成済み':urlsComplete()?'画像URL入力済み':'未作成');}
function updateImageUrlFields(){const fields=$('imageUrlFields');if(!fields)return;const old=['h2Image1','h2Image2','h2Image3'].map(id=>$(id)?.value||'');const headings=h2s(val(3)).slice(0,3);fields.innerHTML=[0,1,2].map(i=>`<div class="url-field"><label>画像${['①','②','③'][i]}URL<input id="h2Image${i+1}" data-save="field" inputmode="url" placeholder="https://..."></label><p class="url-target">挿入先：${headings[i]?`H2「${headings[i]}」の直下`:'STEP3の本文HTMLからH2を取得すると表示されます'}</p></div>`).join('');old.forEach((value,i)=>{$(`h2Image${i+1}`).value=value;});}
function update(){const t=$('theme').value.trim()||'〇〇',a1=val(1),a2=val(2),a3=val(3),e3=!a1?'STEP1の回答を先に貼り付けてください。':!a2?'STEP2の見出し構成回答を先に貼り付けてください。':'';
set(1,`こんにちは！ あなたは自律神経症状専門の整体師です。\n\n「${t}」で検索されやすい内容を作成してください。\n\n【出力形式】\n【キーワード候補】\n1.\n2.\n3.\n4.\n5.\n\n【検索ニーズ】\n1.\n2.\n3.\n4.\n5.\n6.\n7.\n8.\n9.\n10.\n\n検索ニーズは必ず「〜たい」で終わらせ、説明や分類は不要です。`);
set(2,`あなたはプロのWebライターです。以下のSTEP1回答だけを根拠に見出し構成を作成してください。\n\n【STEP1の回答：キーワード候補・検索ニーズ】\n${a1}\n\n仮タイトル、リード文、大見出し・小見出し・本文、まとめの順で出力してください。`,a1?'':'STEP1の回答欄に、キーワード候補・検索ニーズを貼り付けてください。');
set(3,`あなたは自律神経症状専門の整体師でプロのWebライターです。\n\n【記事テーマ】\n${t}\n【STEP1の回答】\n${a1}\n【STEP2の回答：見出し構成】\n${a2}\n\n見出し構成通りに3000字前後の本文を作成してください。本文HTMLは<article>から</article>までを1つのhtmlコードブロックに入れてください。おすすめタイトル5つと最もおすすめのタイトルは、本文HTMLと別のコードブロック外に出してください。`,e3);
const e4=!a1?'STEP1の回答を先に貼り付けてください。':articleError();set(4,`あなたはプロのWebライターです。\n\n【記事テーマ】\n${t}\n【STEP1の回答：キーワード候補・検索ニーズ】\n${a1}\n【STEP3の回答：今回作った記事本文】\n${a3}\n\n【出力形式】\n【メタディスクリプション】\n70〜120文字程度。誰に向けたどんな記事か、ベネフィットとキーワードを自然に含める。\n\n【タグ】\nWordPress用タグを5〜8個、カンマ区切りで出力する。`,e4);
const e5=articleError(true), hs=h2s(a3).slice(0,3), targets=hs.map((x,i)=>`・画像${['①','②','③'][i]}：H2「${x}」下の画像`).join('\n');set(5,`こんにちは！ あなたは自律神経症状専門の整体師です。\n\n今回の記事本文に合う画像を合計4枚作成してください。\n\n【重要】\n画像は合計4枚必要ですが、1枚の画像の中に4枚分を入れないでください。\nコラージュ画像にしないでください。\n分割画面にしないでください。\n4分割にしないでください。\n横に並べないでください。\n縦に並べないでください。\n1つの画像の中に複数場面を入れないでください。\nアイキャッチ画像、画像①、画像②、画像③は、それぞれ別々の独立した画像として作成してください。\nChatGPTでは、画像を1枚ずつ順番に生成してください。\n\n【記事テーマ】\n${t}\n\n【今回作った記事本文】\n${a3}\n\n【作成する画像】\n・アイキャッチ画像：記事全体の内容に合う画像\n${targets}\n\nH2「まとめ」用の画像は作成しないでください。\n\n【画像ごとの方向性】\nアイキャッチ画像：記事全体の悩み・原因・改善の方向性が自然に伝わる画像。\n画像①：H2「${hs[0]||''}」の内容に合わせ、原因・悩み・症状に気づいている場面。\n画像②：H2「${hs[1]||''}」の内容に合わせ、本文内容に合う自律神経・緊張・呼吸・休息・生活リズムなどの場面。\n画像③：H2「${hs[2]||''}」の内容に合わせ、改善方法・セルフケア・生活習慣・軽い運動・リラックス・予防行動などの場面。本文に合わせて自然に調整してください。\n\n【共通条件】\n・文字入れなし\n・図解なし\n・医療説明イラストなし\n・過度に医療的な機器を強調しない\n・人物と背景だけのシンプルな画像\n・安心感のある自然な雰囲気\n・ブログに使いやすい横長16:9\n・30〜50代の日本人女性を基本にする\n・清潔感のある明るい室内を基本にする\n・症状を大げさに表現しない\n・不安や苦痛を強調しすぎない\n・1枚につき1場面だけ\n・コラージュ禁止\n・分割画面禁止\n・複数画像を1枚にまとめることは禁止\n\n【最重要】\n4枚を1枚にまとめないでください。アイキャッチ画像、画像①、画像②、画像③を、それぞれ別々の独立した画像として作成してください。`,e5);}
function save(show=false){const d={answers:{},fields:{},meta:{articleTheme}};document.querySelectorAll('[data-save]').forEach(x=>(x.dataset.save==='answer'?d.answers:d.fields)[x.id]=x.value);d.fields.finalHtml=$('finalHtml')?.value||'';localStorage.setItem(STORAGE_KEY,JSON.stringify(d));if(show)$('saveMessage').textContent='この端末に保存しました。';}
function load(){try{const d=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');[d.answers,d.fields].filter(Boolean).forEach(g=>Object.entries(g).forEach(([k,v])=>{if($(k))$(k).value=v;}));articleTheme=d.meta?.articleTheme||'';}catch(_){}}
function imageInsert(){const e=articleError();if(e){warn(6,e);return;}if(!urlsComplete()){warn(6,'画像①〜③のURLをすべて入力してください。');return;}const urls=['h2Image1','h2Image2','h2Image3'].map(x=>$(x).value.trim());let i=0;$('finalHtml').value=val(3).replace(/<h2\b[^>]*>[\s\S]*?<\/h2>/gi,h=>{const title=h.replace(/<[^>]*>/g,'').trim(),u=title==='まとめ'?'':urls[i++];return u?`${h}\n<img src="${u.replace(/"/g,'&quot;')}" alt="${title.replace(/"/g,'&quot;')}" style="width:100%;height:auto;display:block;margin:24px 0;" loading="lazy">`:h;});warn(6,'');$('final-message').textContent='完成HTMLを作成しました。下のボタンでコピーできます。';updateStatuses();save();$('finalHtml').scrollIntoView({behavior:'smooth',block:'start'});}
async function copy(id,messageId){const target=$(id),message=$(messageId);if(!target?.value){if(message)message.textContent='コピーする内容がありません。';return;}try{await navigator.clipboard.writeText(target.value);}catch(_){target.focus();target.select();document.execCommand('copy');target.setSelectionRange(0,0);}if(message)message.textContent='コピーしました。';}
render();updateImageUrlFields();load();update();updateImageUrlFields();updateStatuses();document.addEventListener('input',e=>{if(!e.target.matches('[data-save],#theme,#reader,#notes'))return;const isStep3=e.target.id===aid(3);if(isStep3){articleTheme=$('theme').value.trim();$('finalHtml').value='';}if(e.target.matches('[data-save="answer"]')){const n=e.target.id.match(/step(\d+)-answer/)?.[1];if(n)$(`answer-message-${n}`).textContent='回答を保存しました。';}if(e.target.id.startsWith('h2Image'))$('finalHtml').value='';update();if(isStep3)updateImageUrlFields();updateStatuses();save();});document.addEventListener('click',e=>{if(e.target.dataset.copy)copy(e.target.dataset.copy,e.target.dataset.message);if(e.target.id==='insertImages')imageInsert();if(e.target.id==='copyFinal')copy('finalHtml','final-message');});$('saveNow').addEventListener('click',()=>save(true));$('clearAll').addEventListener('click',()=>{if(confirm('保存した入力内容をすべて消去しますか？')){localStorage.removeItem(STORAGE_KEY);location.reload();}});

// GitHub Pagesでも、読み込み済みの画面をオフラインで再表示できるようにする。
if('serviceWorker' in navigator&&location.protocol!=='file:'){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
}

// うえむら整体院HPブログは、既存6STEPとは完全に別の保存領域・DOMを使う。
const CLINIC_STORAGE_KEY='uemura-clinic-hp-blog-v1';
const BLOG_LINKS={
  director:{blog:'https://ima-shinshin.site/',chatgpt:'https://chatgpt.com/c/6aa8b8e4-55f8-83ee-8ba6-312343ec6cf3',chatgptIOS:'com.openai.chat://chatgpt.com/c/6aa8b8e4-55f8-83ee-8ba6-312343ec6cf3',wordpress:'https://ima-shinshin.site/wp-admin/edit.php?post_status=draft&post_type=post',wordpressIOS:'googlechromes://ima-shinshin.site/wp-admin/edit.php?post_status=draft&post_type=post'},
  clinic:{blog:'https://uemura-seitaiin.com/blog/',chatgpt:'https://chatgpt.com/c/6aaa4fb9-e234-83ee-aa37-92c1e08c2c5e',chatgptIOS:'com.openai.chat://chatgpt.com/c/6aaa4fb9-e234-83ee-aa37-92c1e08c2c5e',wordpress:'https://uemura-seitaiin.com/wp-admin/edit.php',wordpressIOS:'googlechromes://uemura-seitaiin.com/wp-admin/edit.php'}
};
const CLINIC_BLOG_THEMES = [
  {no:1,kana:'あ行',name:'胃食道逆流症（GERD）の自律神経性タイプ'},
  {no:2,kana:'あ行',name:'一次性高血圧のうち交感神経過活動優位型高血圧'},
  {no:3,kana:'あ行',name:'インスリン抵抗性に伴う自律神経過活動'},
  {no:4,kana:'あ行',name:'嚥下困難感（ヒステリー球・咽喉頭異常感症）'},
  {no:5,kana:'か行',name:'過活動膀胱（OAB）'}, {no:6,kana:'か行',name:'過換気症候群'}, {no:7,kana:'か行',name:'過換気症候群に伴う上腹部不快感'}, {no:8,kana:'か行',name:'過敏性腸症候群（IBS）'}, {no:9,kana:'か行',name:'過敏性食道けいれん'}, {no:10,kana:'か行',name:'過敏性胆道ジスキネジー（胆嚢運動異常）'}, {no:11,kana:'か行',name:'過敏性不眠症（寝つきの悪さ・中途覚醒）'}, {no:12,kana:'か行',name:'過度の交感神経緊張による頻脈発作'}, {no:13,kana:'か行',name:'家族性アミロイドポリニューロパチーに伴う自律神経障害'}, {no:14,kana:'か行',name:'寒冷誘発性レイノー現象'}, {no:15,kana:'か行',name:'起立性調節障害（OD）'}, {no:16,kana:'か行',name:'起立性頻脈を伴う心因性動悸'}, {no:17,kana:'か行',name:'緊張型頭痛'}, {no:18,kana:'か行',name:'機能性眼精疲労（VDT症候群を含む）'}, {no:19,kana:'か行',name:'機能性胸痛（心臓神経症）'}, {no:20,kana:'か行',name:'機能性呼吸困難（息が吸いにくい・息苦しさ）'}, {no:21,kana:'か行',name:'機能性勃起障害（ED：精神・自律神経性）'}, {no:22,kana:'か行',name:'機能性ディスペプシア（FD）'}, {no:23,kana:'か行',name:'機能性低血糖症（自律神経症状優位の低血糖）'}, {no:24,kana:'か行',name:'機能性尿失禁（切迫性尿失禁）'}, {no:25,kana:'か行',name:'機能性発熱（ストレス性微熱）'}, {no:26,kana:'か行',name:'機能性発声障害（心因性・自律神経性失声）'}, {no:27,kana:'か行',name:'機能性腹痛症候群（FAPS）'}, {no:28,kana:'か行',name:'機能性不妊症（ストレス・自律神経要因が強いタイプ）'}, {no:29,kana:'か行',name:'ギラン・バレー症候群後の自律神経障害'}, {no:30,kana:'か行',name:'群発頭痛（自律神経症状を強く伴う頭痛）'}, {no:31,kana:'か行',name:'血管迷走神経性失神を繰り返す体質'}, {no:32,kana:'か行',name:'月経前症候群（PMS）の自律神経優位症状'}, {no:33,kana:'か行',name:'甲状腺機能亢進症に伴う自律神経症状'}, {no:34,kana:'か行',name:'甲状腺機能低下症に伴う自律神経症状'}, {no:35,kana:'か行',name:'更年期障害（自律神経症状が主体のタイプ）'}, {no:36,kana:'か行',name:'骨盤内うっ血症候群'}, {no:37,kana:'か行',name:'喉頭けいれん発作'}, {no:38,kana:'か行',name:'耳管開放症に伴う自律神経不安定'}, {no:39,kana:'か行',name:'間質性膀胱炎・膀胱痛症候群'},
  {no:40,kana:'さ行',name:'自律神経失調症（自律神経機能異常）'}, {no:41,kana:'さ行',name:'自律神経性てんかん発作（自律発作優位のてんかん）'}, {no:42,kana:'さ行',name:'自律神経失調に伴う慢性頭重感・締め付け感'}, {no:43,kana:'さ行',name:'自律神経失調に伴う慢性疲労・倦怠感'}, {no:44,kana:'さ行',name:'自律神経性肥満症（ストレス過食・代謝低下）'}, {no:45,kana:'さ行',name:'純粋自律神経不全症（Pure autonomic failure）'}, {no:46,kana:'さ行',name:'神経調節性失神（血管迷走神経性失神・神経調節性低血圧）'}, {no:47,kana:'さ行',name:'神経循環無力症（Da Costa症候群・心臓神経症）'}, {no:48,kana:'さ行',name:'神経性胃炎（ストレス性胃炎・機能性胃腸症）'}, {no:49,kana:'さ行',name:'神経循環失調による息切れ・胸部絞扼感'}, {no:50,kana:'さ行',name:'神経因性膀胱（排尿障害）'}, {no:51,kana:'さ行',name:'失神を伴う心因性・機能性心疾患（自律神経反射優位）'}, {no:52,kana:'さ行',name:'失神前駆症候群（立ちくらみ・眼前暗黒感を繰り返す状態）'}, {no:53,kana:'さ行',name:'食後低血圧による消化器症状'}, {no:54,kana:'さ行',name:'周期性嘔吐症（自律神経性・機能性嘔吐）'}, {no:55,kana:'さ行',name:'周期性四肢運動障害（PLMD）'}, {no:56,kana:'さ行',name:'心拍変動低下症候群（自律神経機能低下）'}, {no:57,kana:'さ行',name:'心身症（身体表現性障害・自律神経症状主体）'}, {no:58,kana:'さ行',name:'ストレス性の冷え症（末梢循環自律神経障害）'}, {no:59,kana:'さ行',name:'ストレス性・緊張性高血圧発作'}, {no:60,kana:'さ行',name:'ストレス関連ホルモン異常（コルチゾール日内リズム異常）'}, {no:61,kana:'さ行',name:'ストレス誘発性喘息発作（自律神経性気道過敏）'}, {no:62,kana:'さ行',name:'睡眠時無呼吸症候群に伴う自律神経異常'}, {no:63,kana:'さ行',name:'前庭神経炎'}, {no:64,kana:'さ行',name:'線維筋痛症（自律神経異常を伴う痛み症候群）'}, {no:65,kana:'さ行',name:'前立腺肥大症に伴う自律神経性排尿障害'}, {no:66,kana:'さ行',name:'全般性不安症（不安障害）'},
  {no:67,kana:'た行',name:'体位性頻脈症候群／起立性頻脈症候群（POTS）'}, {no:68,kana:'た行',name:'体位性低血圧（起立性低血圧）'}, {no:69,kana:'た行',name:'多系統萎縮症・自律神経障害型（MSA）'}, {no:70,kana:'た行',name:'胆道ジスキネジアに伴う右季肋部痛'}, {no:71,kana:'た行',name:'低血圧症（体質性低血圧・神経調節性低血圧）'}, {no:72,kana:'た行',name:'適応障害に伴う自律神経症状'}, {no:73,kana:'た行',name:'糖尿病性自律神経ニューロパチー'},
  {no:74,kana:'な行',name:'乗り物酔い（動揺病・自律神経過敏）'}, {no:75,kana:'な行',name:'呑気症（空気嚥下症）'},
  {no:76,kana:'は行',name:'反射性失神（状況失神などを含む）'}, {no:77,kana:'は行',name:'パーキンソン病に伴う自律神経障害'}, {no:78,kana:'は行',name:'パニック障害'}, {no:79,kana:'は行',name:'冷えのぼせ（上熱下寒）'}, {no:80,kana:'は行',name:'不適切洞性頻脈（IST）'}, {no:81,kana:'は行',name:'副腎疲労症候群（副腎機能低下症候群と呼ばれる状態像）'}, {no:82,kana:'は行',name:'片頭痛（自律神経症状を伴うタイプ）'}, {no:83,kana:'は行',name:'発作性上室性頻拍に自律神経異常を伴うタイプ'}, {no:84,kana:'は行',name:'本態性徐脈・洞不全症候群の自律神経性タイプ'}, {no:85,kana:'は行',name:'本態性顔面紅潮・紅潮恐怖症'}, {no:86,kana:'は行',name:'本態性多汗症（手掌多汗症など）'}, {no:87,kana:'は行',name:'本態性高血圧（交感神経亢進型）'}, {no:88,kana:'は行',name:'本態性起立性浮腫（夕方に悪化するむくみ）'},
  {no:89,kana:'ま行',name:'末梢循環不全による手足の冷感・しびれ'}, {no:90,kana:'ま行',name:'末梢血管れん縮による冷え・しびれ症'}, {no:91,kana:'ま行',name:'慢性特発性便秘（腸管自律神経機能低下）'}, {no:92,kana:'ま行',name:'慢性下痢症（交感神経緊張型）'}, {no:93,kana:'ま行',name:'慢性過換気症候群'}, {no:94,kana:'ま行',name:'慢性疲労症候群（ME／CFS）'}, {no:95,kana:'ま行',name:'めまい症（自律神経性めまい）'}, {no:96,kana:'ま行',name:'メニエール病'},
  {no:97,kana:'や行',name:'夜間頻尿（自律神経調節異常）'},
  {no:98,kana:'ら行',name:'良性発作性頭位めまい症に伴う自律神経失調'}, {no:99,kana:'ら行',name:'レビー小体型認知症に伴う自律神経障害'}, {no:100,kana:'ら行',name:'レストレスレッグス症候群（むずむず脚症候群）'}
];
const CUSTOM_THEMES_STORAGE_KEY='uemura-clinic-custom-themes-v1';
const TITLE_HISTORY_STORAGE_KEY='uemura-hp-post-title-history-v1';
const LAST_CREATED_POST_STORAGE_KEY='uemura-clinic-last-created-post-v1';
const EXISTING_HP_POST_TITLES=['甲状腺機能亢進症','甲状腺機能低下症','更年期の不調','骨盤の重だるさ・下腹部痛','喉が詰まって息ができない','耳管開放症','間質性膀胱炎','自律神経失調症','てんかん','頭が重い・スッキリしない','体のだるさ・倦怠感','ストレスによる過食','純粋自律神経不全症','緊張や痛みで起こる失神','運動時の動悸','ストレス性胃炎','息切れ','神経因性膀胱','心因性失神','立ちくらみ','食後低血圧','周期性嘔吐症','周期性四肢運動障害','心拍変動の低下','心身症','ストレス性冷え症','ストレス性高血圧','ストレスホルモンの乱れ','気管支喘息','睡眠時無呼吸症候群','前庭神経炎','前立腺肥大症','不安障害','起立性頻脈症候群','起立性低血圧','多系統萎縮症','右わき腹の痛み','低血圧症','適応障害','糖尿病による自律神経障害','乗り物酔い','呑気症','反射性失神','パーキンソン病の自律神経障害','パニック障害','冷えのぼせ','安静時の頻脈','副腎疲労症候群','偏頭痛','急な動悸','徐脈（脈が遅い）','顔の赤み','多汗症','高血圧','足のむくみ','手足の冷え・血流低下','手足の冷え・しびれ','便秘','下痢','息苦しさ','慢性疲労症候群（ME／CFS）','めまい症（自律神経性めまい）','メニエール病','夜間頻尿','良性発作性頭位めまい症','レビー小体型認知症','レストレスレッグス症候群（むずむず脚症候群）'];
const CLINIC_KANA_OPTIONS=['あ行','か行','さ行','た行','な行','は行','ま行','や行','ら行'];
function readStorageArray(key){try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value:[];}catch(_){return [];}}
function loadCustomThemes(){return readStorageArray(CUSTOM_THEMES_STORAGE_KEY).filter(theme=>theme&&theme.id&&Number.isInteger(theme.no)&&CLINIC_KANA_OPTIONS.includes(theme.kana)&&typeof theme.name==='string');}
function saveCustomThemes(themes){localStorage.setItem(CUSTOM_THEMES_STORAGE_KEY,JSON.stringify(themes));}
function allClinicThemes(){return [...CLINIC_BLOG_THEMES,...loadCustomThemes()];}
function loadTitleHistory(){return readStorageArray(TITLE_HISTORY_STORAGE_KEY).filter(item=>item&&item.id&&typeof item.title==='string'&&typeof item.createdAt==='string');}
function saveTitleHistory(history){localStorage.setItem(TITLE_HISTORY_STORAGE_KEY,JSON.stringify(history));}
function addTitleToHistory(title){const trimmed=title.trim();if(!trimmed)return;const history=loadTitleHistory();if(history.some(item=>item.title.trim()===trimmed))return;history.unshift({id:`title-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,title:trimmed,createdAt:new Date().toISOString()});saveTitleHistory(history);}
function normalizedTitle(title){return String(title||'').trim();}
function allPostTitles(){const titles=new Map();EXISTING_HP_POST_TITLES.forEach(title=>titles.set(normalizedTitle(title),{title:normalizedTitle(title),fixed:true}));loadTitleHistory().forEach(item=>{const title=normalizedTitle(item.title);if(title&&!titles.has(title))titles.set(title,{title,fixed:false,createdAt:item.createdAt,id:item.id});});return [...titles.values()].sort((a,b)=>a.title.localeCompare(b.title,'ja'));}
function formatSavedAt(savedAt){const date=new Date(savedAt);return Number.isNaN(date.getTime())?'':date.toLocaleString('ja-JP',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).replace(/\//g,'/');}
function renderLastCreatedPost(){const card=clinicEl('lastCreatedPost');if(!card)return;let post=null;try{post=JSON.parse(localStorage.getItem(LAST_CREATED_POST_STORAGE_KEY)||'null');}catch(_){}if(!post||!normalizedTitle(post.title)){card.innerHTML='<h3>前回作成した記事</h3><p class="last-created-post-meta">まだ作成履歴がありません</p>';return;}card.innerHTML=`<h3>前回作成した記事</h3><p class="last-created-post-title">${esc(post.title)}</p><p class="last-created-post-meta">元テーマ：${esc(post.theme||'')}</p><p class="last-created-post-meta">最終保存：${esc(formatSavedAt(post.savedAt)||'')}</p>`;}
function saveLastCreatedPost(){const title=clinicValue('clinic-title'),theme=clinicValue('clinic-theme');if(!title)return;localStorage.setItem(LAST_CREATED_POST_STORAGE_KEY,JSON.stringify({title,theme,savedAt:new Date().toISOString()}));renderLastCreatedPost();}
const clinicSteps=[
  ['おすすめタイトル作成','元テーマ・病名から、投稿タイトルとSEOタイトルを作成します。'],
  ['記事一式作成','採用タイトルをもとに、WordPressに必要な記事一式を作成します。'],
  ['アイキャッチ画像作成','完成記事に合う、横長のアイキャッチ画像を作成します。']
];
const clinicEl=id=>document.getElementById(id);
const clinicValue=id=>clinicEl(id)?.value.trim()||'';
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function clinicPrompt(n){ return clinicEl(`clinic-step${n}-prompt`); }
function clinicAnswer(n){ return clinicEl(`clinic-step${n}-answer`); }
function clinicStatus(n,done,label){const e=clinicEl(`clinic-status-${n}`);if(!e)return;e.textContent=`状態：${label||(done?'回答貼り付け済み':'未作成')}`;e.classList.toggle('is-done',done);}
function clinicNotice(n,text=''){const e=clinicEl(`clinic-warning-${n}`);if(e)e.textContent=text;}
let clinicThemeKana='すべて';
function renderClinicThemeList(){
  const query=(clinicEl('clinic-theme-search')?.value||'').trim().toLocaleLowerCase();
  const matches=allClinicThemes().filter(theme=>(clinicThemeKana==='すべて'||theme.kana===clinicThemeKana)&&theme.name.toLocaleLowerCase().includes(query));
  const results=clinicEl('clinic-theme-results');
  if(!results)return;
  results.innerHTML=matches.length?matches.map(theme=>`<article class="clinic-theme-item"><button type="button" class="clinic-theme-select" data-clinic-theme-name="${esc(theme.name)}"><span>No.${theme.no}${theme.id?' ・ 追加テーマ':''}</span>${esc(theme.name)}</button>${theme.id?`<div class="custom-theme-actions"><button type="button" data-edit-custom-theme="${esc(theme.id)}">編集</button><button type="button" data-delete-custom-theme="${esc(theme.id)}">削除</button></div>`:''}</article>`).join(''):'<p class="clinic-theme-empty">該当する元テーマ・病名がありません</p>';
  document.querySelectorAll('[data-clinic-kana]').forEach(button=>button.classList.toggle('is-active',button.dataset.clinicKana===clinicThemeKana));
}
function ensureCustomThemeControls(){
  const picker=clinicEl('clinic-theme-picker');
  if(!picker||clinicEl('openCustomThemeForm'))return;
  clinicEl('clinic-theme-search').insertAdjacentHTML('beforebegin','<button type="button" class="clinic-add-theme-button" id="openCustomThemeForm">＋ 新しいテーマを追加</button><section class="custom-theme-form" id="custom-theme-form" hidden><strong id="custom-theme-form-title">新しいテーマを追加</strong><label>五十音<select id="custom-theme-kana">'+CLINIC_KANA_OPTIONS.map(kana=>`<option value="${kana}">${kana}</option>`).join('')+'</select></label><label>元テーマ・病名<input id="custom-theme-name" placeholder="新しく追加するテーマを入力"></label><div class="custom-theme-form-actions"><button type="button" class="primary" id="saveCustomTheme">追加する</button><button type="button" class="secondary" id="cancelCustomTheme">キャンセル</button></div><p class="field-message" id="custom-theme-message" aria-live="polite"></p></section>');
}
function openClinicThemePicker(){const picker=clinicEl('clinic-theme-picker');if(!picker)return;ensureCustomThemeControls();picker.hidden=false;renderClinicThemeList();clinicEl('clinic-theme-search').focus();}
function closeClinicThemePicker(){const picker=clinicEl('clinic-theme-picker');if(picker)picker.hidden=true;}
function selectClinicTheme(name){
  clinicEl('clinic-theme').value=name;
  clinicUpdate();
  clinicSave();
  closeClinicThemePicker();
  clinicEl('clinic-theme').scrollIntoView({behavior:'smooth',block:'center'});
}
function openCustomThemeForm(theme=null){
  const form=clinicEl('custom-theme-form');
  if(!form)return;
  form.hidden=false;
  form.dataset.editId=theme?.id||'';
  clinicEl('custom-theme-form-title').textContent=theme?'追加テーマを編集':'新しいテーマを追加';
  clinicEl('saveCustomTheme').textContent=theme?'保存する':'追加する';
  clinicEl('custom-theme-kana').value=theme?.kana||'あ行';
  clinicEl('custom-theme-name').value=theme?.name||'';
  clinicEl('custom-theme-message').textContent='';
  clinicEl('custom-theme-name').focus();
}
function closeCustomThemeForm(){const form=clinicEl('custom-theme-form');if(form)form.hidden=true;}
function saveCustomThemeFromForm(){
  const form=clinicEl('custom-theme-form'),message=clinicEl('custom-theme-message');
  const name=clinicEl('custom-theme-name').value.trim(),kana=clinicEl('custom-theme-kana').value,editId=form.dataset.editId;
  if(!name){message.textContent='元テーマ・病名を入力してください。';return;}
  const themes=loadCustomThemes();
  if(allClinicThemes().some(theme=>theme.name.trim()===name&&theme.id!==editId)){message.textContent='同じ元テーマ・病名がすでに登録されています';return;}
  if(editId){const target=themes.find(theme=>theme.id===editId);if(!target)return;target.kana=kana;target.name=name;}else{const maxNo=Math.max(100,...themes.map(theme=>theme.no));themes.push({id:`custom-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,no:maxNo+1,kana,name});}
  saveCustomThemes(themes);closeCustomThemeForm();renderClinicThemeList();
}
function editCustomTheme(id){const theme=loadCustomThemes().find(item=>item.id===id);if(theme)openCustomThemeForm(theme);}
function deleteCustomTheme(id){const theme=loadCustomThemes().find(item=>item.id===id);if(!theme||!confirm('この元テーマ・病名を削除しますか？'))return;saveCustomThemes(loadCustomThemes().filter(item=>item.id!==id));renderClinicThemeList();}
function renderTitleHistory(){
  const query=(document.getElementById('title-history-search')?.value||'').trim().toLocaleLowerCase();
  const results=document.getElementById('title-history-results');
  if(!results)return;
  const history=allPostTitles().filter(item=>item.title.toLocaleLowerCase().includes(query));
  results.innerHTML=history.length?history.map(item=>`<article class="title-history-item"><button type="button" class="title-history-select" data-history-title="${esc(item.title)}"><span>${item.fixed?'過去投稿済み':new Date(item.createdAt).toLocaleDateString('ja-JP')}</span>${esc(item.title)}</button>${item.fixed?'':`<button type="button" class="title-history-delete" data-delete-history-title="${esc(item.id)}">削除</button>`}</article>`).join(''):'<p class="clinic-theme-empty">該当する投稿タイトルがありません</p>';
}
function openTitleHistoryPicker(){const picker=document.getElementById('title-history-picker');picker.hidden=false;renderTitleHistory();document.getElementById('title-history-search').focus();}
function closeTitleHistoryPicker(){document.getElementById('title-history-picker').hidden=true;}
function selectHistoryTitle(title){const input=$('theme');input.value=title;input.dispatchEvent(new Event('input',{bubbles:true}));closeTitleHistoryPicker();input.scrollIntoView({behavior:'smooth',block:'center'});}
function deleteHistoryTitle(id){if(!confirm('この投稿タイトルを一覧から削除しますか？'))return;saveTitleHistory(loadTitleHistory().filter(item=>item.id!==id));renderTitleHistory();}
function migrateSavedClinicTitle(){
  if(localStorage.getItem(TITLE_HISTORY_STORAGE_KEY)!==null)return;
  let saved={};try{saved=JSON.parse(localStorage.getItem(CLINIC_STORAGE_KEY)||'{}');}catch(_){}
  const title=typeof saved.title==='string'?saved.title:'';
  if(title.trim())addTitleToHistory(title);
  else saveTitleHistory([]);
}
function renderClinic(){
  clinicEl('clinicWorkflow').innerHTML=clinicSteps.map(([name,desc],i)=>{const n=i+1;let extra='';
    if(n===1)extra='<div class="answer-field"><label>元テーマ・病名<input id="clinic-theme" data-clinic-save placeholder="例：甲状腺機能低下症に伴う自律神経症状"></label><button type="button" class="clinic-theme-picker-button" id="openClinicThemePicker">元テーマ・病名一覧から選ぶ</button><section class="clinic-theme-picker" id="clinic-theme-picker" hidden aria-label="元テーマ・病名一覧"><div class="clinic-theme-picker-head"><strong>元テーマ・病名一覧</strong><button type="button" class="secondary clinic-theme-close" id="closeClinicThemePicker">一覧を閉じる</button></div><input id="clinic-theme-search" type="search" placeholder="病名・症状名を検索" aria-label="病名・症状名を検索"><div class="clinic-kana-filters" aria-label="五十音で絞り込み">'+['すべて','あ行','か行','さ行','た行','な行','は行','ま行','や行','ら行'].map(kana=>`<button type="button" data-clinic-kana="${kana}">${kana}</button>`).join('')+'</div><div class="clinic-theme-results" id="clinic-theme-results" aria-live="polite"></div></section></div>';
    if(n===2)extra='<div class="answer-field"><label>最終的に採用した投稿タイトル<input id="clinic-title" data-clinic-save placeholder="STEP1から選んだタイトルを入力"></label><p class="hint">STEP1の回答はプロンプトに自動で反映されます。</p></div>';
    const answerField=n===3?'<p class="hint">画像を作成したら、WordPressでアイキャッチ画像に設定して完了です。</p>':`<div class="answer-field"><label>${n===2?'ChatGPTの記事本文HTMLを貼り付ける欄':'ChatGPTの回答を貼り付ける欄'}<textarea class="answer-textarea" id="clinic-step${n}-answer" data-clinic-save placeholder="${n===2?'ChatGPTから返ってきた記事本文HTMLだけをここに貼り付け':'ChatGPTの回答をここに貼り付け'}"></textarea></label><button type="button" class="secondary clinic-answer-save" data-clinic-answer-save="${n}">回答を保存</button><p class="field-message" id="clinic-answer-message-${n}" aria-live="polite"></p></div>`;
    return `<details class="step" ${n===1?'open':''}><summary><span class="step-number">STEP ${n}</span><strong class="step-title">${name}</strong><span class="step-status" id="clinic-status-${n}">状態：未作成</span></summary><div class="step-body"><p class="hint">${desc}</p><p id="clinic-warning-${n}" class="step-warning" aria-live="polite"></p>${extra}<div class="prompt-field"><label>ChatGPTに貼り付けるプロンプト<textarea class="prompt-textarea" id="clinic-step${n}-prompt" readonly></textarea></label><button type="button" class="copy-button" data-clinic-copy="clinic-step${n}-prompt" data-clinic-message="clinic-copy-${n}">プロンプトをコピー</button><p class="field-message" id="clinic-copy-${n}" aria-live="polite"></p></div>${answerField}</div></details>`;
  }).join('');
}
function clinicUpdate(){
  const theme=clinicValue('clinic-theme')||'〇〇';
  const answer1=clinicValue('clinic-step1-answer');
  const title=clinicValue('clinic-title');
  const answer2=clinicValue('clinic-step2-answer');
  clinicPrompt(1).value=`あなたは「うえむら整体院」の自律神経ブログを作成するプロのWebライターです。\n\n以下の元テーマ・病名から、\n\n・WordPressで使用する「投稿タイトル」\n・記事冒頭で使用する「SEOタイトル」\n\nを1つずつ作成してください。\n\n【元テーマ・病名】\n${theme}\n\n【投稿タイトルの条件】\n・一般の患者さんが見てすぐ分かる\n・短くシンプル\n・検索されやすい\n・「自分の症状かもしれない」と感じやすい\n・必要以上に長くしない\n・元テーマと意味を変えない\n・病名そのものが一般的で検索需要もある場合は、無理に症状名へ変更しない\n\n【SEOタイトルの条件】\n・投稿タイトルより少し詳しくする\n・病名／症状を自然に含める\n・代表的な悩みや症状を自然に含める\n・自律神経との関係が分かる形にする\n・不自然なSEOキーワードの羅列にしない\n・必要以上に長くしない\n\n【重要】\nタイトル候補を複数出さないでください。\n「最もおすすめ」などの説明も不要です。\n理由や解説も不要です。\n\n必ず以下の2行だけを出力してください。\n\n投稿タイトル：○○\nSEOタイトル：○○\n\nそれ以外の文章は出力しないでください。`;
  const step2Warning=!answer1?'STEP1のChatGPT回答を貼り付けてください。':!title?'最終的に採用した投稿タイトルを入力してください。':'';
  clinicNotice(2,step2Warning);
  clinicPrompt(2).value=step2Warning?'':`あなたは「うえむら整体院」の自律神経ブログを作成するプロのWebライターです。医学的正確性を最優先し、一般の患者さんにわかりやすい記事を作成してください。\n\n【STEP1のタイトル候補・回答】\n${answer1}\n\n【最終的に採用した投稿タイトル】\n${title}\n\n以下を必ず、順番を一切変えずに作成してください。各項目の内容は必ず個別のコードブロックに入れてください。説明文や項目の追加は不要です。\n\n### パーマリンク\n\`\`\`text\n英小文字・ハイフン形式。\n\`\`\`\n\n### カテゴリ\n\`\`\`text\n次の12種類から必ず1つだけ選ぶ。新しいカテゴリは作らない。\n1. ホルモン・代謝・婦人科\n2. めまい・耳の症状\n3. 全身性・その他の自律神経症状\n4. 冷え・ほてり・汗・むくみ\n5. 動悸・血圧・失神\n6. 呼吸・胸の症状\n7. 排尿・泌尿器の悩み\n8. 疲労・ストレス・不安\n9. 睡眠の悩み\n10. 神経疾患に伴う自律神経障害\n11. 胃腸・お腹の不調\n12. 頭痛・目・のどの症状\n\`\`\`\n\n### タグ\n\`\`\`text\nWordPress用タグをカンマ区切りで。\n\`\`\`\n\n### 記事本文\n\`\`\`html\n<article style="max-width:780px;margin:0 auto;color:#222;font-size:16px;line-height:2.2;">\n…\n</article>\n\`\`\`\n\n### メタディスクリプション\n\`\`\`text\n記事内容を簡潔に説明し、投稿タイトル・主要キーワードを自然に含める。SEOキーワードを不自然に羅列しない。\n\`\`\`\n\n### フォーカスキーフレーズ\n\`\`\`text\n記事内容・検索意図・SEOに最も適したものを1つだけ。投稿タイトルと同一でなくてよい。\n\`\`\`\n\n【記事本文HTMLの必須要件】\n・2026年9月に作成した「耳管開放症」の記事構成・説明量を基準にし、簡略化しない。読者が「なぜその症状が起こるのか」を理解できる内容にする。\n・WordPress投稿タイトルと、記事冒頭のSEOタイトルは分ける。最初のH2は <h2 style="margin:2.5em 0 1em;line-height:1.6;"><strong>SEOタイトル</strong></h2> とし、病名／症状、代表的な悩み、自律神経との関係を自然に含める。\n・次のH2は <h2 style="margin:2.5em 0 1em;"><strong>この記事でわかること</strong></h2>。単なる箇条書きにせず、「何もしていないのに心臓がドキドキする」「以前より汗をかきやすくなった」などテーマに合う具体症状から始め、病気／症状の概要、身体で起きていること、自律神経との関係、記事で説明する内容まで説明する。\n・目次は危険レベルと受診の目安、症状チェック、原因と自律神経との関係、自宅でできる生活ケア、うえむら整体院でできること、まとめへリンクする。各H2のidは順に risk、check、cause、care、clinic、summary を使う。\n・「危険レベルと受診の目安」はテーマに応じて危険レベル（例：●●〇〇〇）を示し、原則3段階程度で説明する。各ボックスに必ず「状態：」「目安：」「行動：」を含め、重大な病気を自律神経の乱れとして片付けない。\n・「症状チェック」は10項目前後の <ul style="line-height:2.2;"> を使う。チェックリスト後に、特徴的な症状、他の病気との違い、症状だけでは診断できないことを説明する。\n・「原因と自律神経との関係」は中心部分として複数のH3を使う。「そもそも○○とは？」「身体では何が起こっている？」「原因1〜3」「なぜ○○が起こるの？」「自律神経とはどのような関係がある？」「ストレスとの関係」「どのように診断するの？」など、患者さんが抱きやすい疑問をテーマに合わせて使う。\n・医学的な病態がある疾患を何でも自律神経の乱れが原因とは説明しない。「自律神経の乱れが原因です」「自律神経を整えれば治ります」「整体で治ります」と断定しない。疾患そのものの医学的原因・病態を先に説明し、自律神経との関係は分けて説明する。必要に応じて「自律神経が乱れたことが○○の直接的な原因という意味ではありません」「この症状だけで○○と判断することはできません」「ほかの疾患でも同様の症状が起こることがあります」を入れる。\n・「自宅でできる生活ケア」は、医療機関で診断・治療が必要な疾患なら最初にそれを説明する。その後、テーマに合う具体的な生活ケアを8〜10項目程度示し、睡眠・食事・運動だけの一般論にしない。\n・「うえむら整体院でできること」の施設名は必ず「うえむら整体院」。病気そのものを診断・治療できる表現はしない。「○○は医療機関で診断・治療を受ける必要がある病気です」「うえむら整体院で○○そのものを診断・治療することはできません」を必要に応じて明記する。その上で睡眠、疲労、呼吸、姿勢、身体の緊張など身体面を確認することを書く。自然に合う場合は「自律神経が働きやすく、夜に深く眠り、一晩寝たらしっかり回復できる身体づくりをサポートします。」を使うが、「自律神経を整えれば○○が治るという意味ではありません」と線引きする。\n・「まとめ」は、どんな病気／症状か、代表的症状、主な原因や仕組み、自律神経との関係、受診すべきケースを簡潔に振り返り、読者が次に何をすればよいか分かる文章で終える。`;
  const step3Warning=!answer2?'STEP2の記事本文HTMLを貼り付けてください。':!title?'採用タイトルを入力してください。':'';
  clinicNotice(3,step3Warning);
  clinicPrompt(3).value=step3Warning?'':`あなたは「うえむら整体院」の自律神経ブログのデザイナーです。以下の記事用に、アイキャッチ画像を1枚作成してください。\n\n【投稿タイトル】\n${title}\n\n【記事本文HTML】\n${answer2}\n\n【画像の条件】\n・ブログに使いやすい横長16:9\n・文字入れなし、図解なし、コラージュ・分割画面なし\n・記事内容が自然に伝わる人物と背景だけのシンプルな1場面\n・30〜50代の日本人を基本に、清潔感と安心感のある自然な雰囲気\n・症状や苦痛を大げさに表現しない\n・過度に医療的な機器を強調しない`;
  clinicStatus(1,!!clinicValue('clinic-step1-answer'));
  clinicStatus(2,!!answer2);
  clinicStatus(3,false,'画像を作成');
}
function clinicSave(show=false){let previous={};try{previous=JSON.parse(localStorage.getItem(CLINIC_STORAGE_KEY)||'{}');}catch(_){}const data={theme:clinicEl('clinic-theme')?.value||'',title:clinicEl('clinic-title')?.value||'',answers:{1:clinicEl('clinic-step1-answer')?.value||'',2:clinicEl('clinic-step2-answer')?.value||'',3:previous.answers?.[3]||''}};localStorage.setItem(CLINIC_STORAGE_KEY,JSON.stringify(data));if(show)clinicEl('clinicSaveMessage').textContent='うえむら整体院HPブログの内容をこの端末に保存しました。';}
function clinicLoad(){try{const d=JSON.parse(localStorage.getItem(CLINIC_STORAGE_KEY)||'{}');if(clinicEl('clinic-theme'))clinicEl('clinic-theme').value=d.theme||'';if(clinicEl('clinic-title'))clinicEl('clinic-title').value=d.title||'';Object.entries(d.answers||{}).forEach(([n,v])=>clinicAnswer(n).value=v||'');}catch(_){}}
function isIOS(){return /iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);}
function workLinkMarkup(links,type,label){const mobile=isIOS(),href=mobile?links[`${type}IOS`]:links[type],attributes=mobile?'':' target="_blank" rel="noopener noreferrer"';return `<a class="blog-quick-link" href="${href}"${attributes}>${label}</a>`;}
function renderBlogQuickLinks(kind){const links=BLOG_LINKS[kind],container=clinicEl('blogQuickLinks');if(!links||!container)return;container.innerHTML=`<a class="blog-quick-link" href="${links.blog}" target="_blank" rel="noopener noreferrer">ブログを見る</a>${workLinkMarkup(links,'chatgpt','ChatGPT')}${workLinkMarkup(links,'wordpress','WordPress')}`;}
function showBlog(kind){const director=kind==='director';clinicEl('directorBlog').hidden=!director;clinicEl('clinicBlog').hidden=director;document.querySelectorAll('.blog-switch').forEach(b=>{const active=b.dataset.blog===kind;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',active);});renderBlogQuickLinks(kind);localStorage.setItem('totto-blog-assistant-active-blog',kind);}

renderClinic();clinicLoad();migrateSavedClinicTitle();clinicUpdate();renderLastCreatedPost();
document.querySelectorAll('.blog-switch').forEach(b=>b.addEventListener('click',()=>showBlog(b.dataset.blog)));
showBlog(localStorage.getItem('totto-blog-assistant-active-blog')||'director');
document.addEventListener('input',e=>{if(!e.target.matches('[data-clinic-save]'))return;clinicUpdate();clinicSave();});
document.addEventListener('click',e=>{const copyId=e.target.dataset.clinicCopy;if(copyId)copy(copyId,e.target.dataset.clinicMessage);const n=e.target.dataset.clinicAnswerSave;if(n){clinicSave();if(n==='2'&&clinicValue('clinic-step2-answer'))saveLastCreatedPost();clinicEl(`clinic-answer-message-${n}`).textContent='回答を保存しました。';}if(e.target.id==='clinicSaveNow')clinicSave(true);if(e.target.id==='clinicClearAll'&&confirm('うえむら整体院HPブログの保存内容をすべて消去しますか？')){localStorage.removeItem(CLINIC_STORAGE_KEY);location.reload();}});
document.addEventListener('input',e=>{if(e.target.id==='clinic-theme-search')renderClinicThemeList();});
document.addEventListener('click',e=>{
  if(e.target.id==='openClinicThemePicker')openClinicThemePicker();
  if(e.target.id==='closeClinicThemePicker')closeClinicThemePicker();
  const kanaButton=e.target.closest('[data-clinic-kana]');
  if(kanaButton){clinicThemeKana=kanaButton.dataset.clinicKana;renderClinicThemeList();}
  const themeButton=e.target.closest('[data-clinic-theme-name]');
  if(themeButton)selectClinicTheme(themeButton.dataset.clinicThemeName);
  if(e.target.id==='openCustomThemeForm')openCustomThemeForm();
  if(e.target.id==='cancelCustomTheme')closeCustomThemeForm();
  if(e.target.id==='saveCustomTheme')saveCustomThemeFromForm();
  const editButton=e.target.closest('[data-edit-custom-theme]');
  if(editButton)editCustomTheme(editButton.dataset.editCustomTheme);
  const deleteButton=e.target.closest('[data-delete-custom-theme]');
  if(deleteButton)deleteCustomTheme(deleteButton.dataset.deleteCustomTheme);
});
document.addEventListener('click',e=>{
  const answerSave=e.target.dataset.clinicAnswerSave;
  if(answerSave==='2'||e.target.id==='clinicSaveNow')addTitleToHistory(clinicValue('clinic-title'));
  if(e.target.id==='openTitleHistoryPicker')openTitleHistoryPicker();
  if(e.target.id==='closeTitleHistoryPicker')closeTitleHistoryPicker();
  const titleButton=e.target.closest('[data-history-title]');
  if(titleButton)selectHistoryTitle(titleButton.dataset.historyTitle);
  const deleteButton=e.target.closest('[data-delete-history-title]');
  if(deleteButton)deleteHistoryTitle(deleteButton.dataset.deleteHistoryTitle);
});
document.addEventListener('input',e=>{if(e.target.id==='title-history-search')renderTitleHistory();});
