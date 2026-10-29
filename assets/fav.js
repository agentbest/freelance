/* 気になる案件の保存（ブラウザの localStorage だけ。サーバーには送らない） */
(function(){
  var KEY = 'abf_fav', HKEY = 'abf_hist';
  function get(k){ try{ return JSON.parse(localStorage.getItem(k) || '[]'); }catch(e){ return []; } }
  function set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
  function sync(){
    var f = get(KEY);
    document.querySelectorAll('[data-fav]').forEach(function(b){
      var on = f.indexOf(b.getAttribute('data-fav')) >= 0;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.textContent = on ? '★ 保存済み' : '☆ 気になる';
    });
    document.querySelectorAll('[data-fav-count]').forEach(function(e){ e.textContent = f.length || ''; e.hidden = !f.length; });
  }
  document.addEventListener('click', function(e){
    var b = e.target.closest('[data-fav]');
    if(!b) return;
    e.preventDefault();
    var f = get(KEY), id = b.getAttribute('data-fav'), i = f.indexOf(id);
    if(i >= 0) f.splice(i, 1);
    else { f.unshift(id); if(window.gtag) gtag('event', 'fav_add', {job_no: id, page_path: location.pathname}); }
    set(KEY, f.slice(0, 100));
    sync();
    document.dispatchEvent(new Event('fav-change'));
  });
  // 案件ページを開いたら「最近見た案件」に残す
  var v = document.querySelector('[data-view-job]');
  if(v){ var id = v.getAttribute('data-view-job'), h = get(HKEY).filter(function(x){ return x !== id; }); h.unshift(id); set(HKEY, h.slice(0, 20)); }
  window.ABF = {get: get, KEY: KEY, HKEY: HKEY};
  document.addEventListener('fav-sync', sync);
  sync();
})();
