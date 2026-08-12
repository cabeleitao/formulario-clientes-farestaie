(function(){
  "use strict";

  var form = document.getElementById('clientForm');
  var steps = Array.prototype.slice.call(document.querySelectorAll('.step'));
  var trackNodes = Array.prototype.slice.call(document.querySelectorAll('.track__node'));
  var trackFill = document.getElementById('trackFill');
  var resultOk = document.getElementById('resultOk');
  var resultError = document.getElementById('resultError');
  var retryBtn = document.getElementById('retryBtn');
  var submitBtn = document.getElementById('submitBtn');
  var currentStep = 1;
  var TOTAL_STEPS = steps.length;

  /* ---------- Folio + fecha (etiqueta de muestra) ---------- */
  function pad(n){ return String(n).padStart(2,'0'); }
  var now = new Date();
  var folio = 'FT-' + now.getFullYear() + pad(now.getMonth()+1) + pad(now.getDate()) +
              '-' + Math.floor(1000 + Math.random()*9000);
  document.getElementById('folioValue').textContent = folio;
  document.getElementById('dateValue').textContent = now.toLocaleDateString('es-AR', { day:'2-digit', month:'2-digit', year:'numeric' });

  /* ---------- Navegación entre pasos ---------- */
  function goToStep(n){
    steps.forEach(function(s){
      s.classList.toggle('is-active', Number(s.dataset.step) === n);
    });
    trackNodes.forEach(function(node){
      var idx = Number(node.dataset.step);
      node.classList.toggle('is-active', idx === n);
      node.classList.toggle('is-done', idx < n);
    });
    trackFill.style.width = (n / TOTAL_STEPS * 100) + '%';
    currentStep = n;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function validateStep(stepEl){
    var valid = true;
    var required = stepEl.querySelectorAll('[required]');
    var radioGroupsSeen = {};

    required.forEach(function(input){
      var field = input.closest('.field') || input.closest('fieldset.field');
      if(input.type === 'radio'){
        if(radioGroupsSeen[input.name]) return;
        radioGroupsSeen[input.name] = true;
        var checked = stepEl.querySelector('input[name="'+input.name+'"]:checked');
        if(!checked){ valid = false; markError(field); } else { clearError(field); }
        return;
      }
      if(input.type === 'checkbox'){
        if(!input.checked){ valid = false; markError(field); } else { clearError(field); }
        return;
      }
      if(!input.value || !input.value.trim()){
        valid = false; markError(field);
      } else if(input.type === 'email' && !isEmail(input.value)){
        valid = false; markError(field);
      } else {
        clearError(field);
      }
    });
    return valid;
  }

  function isEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  function markError(field){
    if(!field) return;
    field.classList.add('has-error');
  }
  function clearError(field){
    if(!field) return;
    field.classList.remove('has-error');
  }

  document.querySelectorAll('[data-next]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var stepEl = steps[currentStep - 1];
      if(!validateStep(stepEl)){
        var firstError = stepEl.querySelector('.has-error');
        if(firstError){ firstError.scrollIntoView({ behavior:'smooth', block:'center' }); }
        return;
      }
      if(currentStep < TOTAL_STEPS){ goToStep(currentStep + 1); }
    });
  });

  document.querySelectorAll('[data-prev]').forEach(function(btn){
    btn.addEventListener('click', function(){
      if(currentStep > 1){ goToStep(currentStep - 1); }
    });
  });

  /* ---------- Contactos opcionales ---------- */
  document.querySelectorAll('[data-add-contact]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var prefix = btn.getAttribute('data-add-contact');
      var blocks = document.querySelectorAll('[data-contact-optional^="'+prefix+'"]');
      for(var i=0; i<blocks.length; i++){
        if(blocks[i].hidden){
          blocks[i].hidden = false;
          if(i === blocks.length - 1){ btn.hidden = true; }
          break;
        }
      }
    });
  });

  /* Limpiar error al tipear/elegir */
  form.addEventListener('input', function(e){
    var field = e.target.closest('.field') || e.target.closest('fieldset.field');
    if(field) clearError(field);
  });
  form.addEventListener('change', function(e){
    var field = e.target.closest('.field') || e.target.closest('fieldset.field');
    if(field) clearError(field);
  });

  /* ---------- Envío ---------- */
  function collectData(){
    var fd = new FormData(form);
    var data = {};
    fd.forEach(function(value, key){ data[key] = value; });
    data.folio = folio;
    data.fecha = now.toISOString();
    return data;
  }

  function showSending(){
    var overlay = document.createElement('div');
    overlay.className = 'sending-overlay';
    overlay.id = 'sendingOverlay';
    overlay.innerHTML = '<div class="sending-box"><span class="spinner" aria-hidden="true"></span>Enviando datos…</div>';
    document.body.appendChild(overlay);
  }
  function hideSending(){
    var overlay = document.getElementById('sendingOverlay');
    if(overlay) overlay.remove();
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var stepEl = steps[currentStep - 1];
    if(!validateStep(stepEl)) return;

    var url = window.APPS_SCRIPT_URL;
    if(!url || url.indexOf('PEGAR_URL') !== -1){
      alert('Falta configurar la URL del Apps Script en assets/config.js');
      return;
    }

    submitBtn.disabled = true;
    showSending();

    fetch(url, {
      method: 'POST',
      mode: 'no-cors', // Apps Script no devuelve headers CORS; enviamos "a ciegas" y confiamos en que el POST llega
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(collectData())
    })
    .then(function(){
      hideSending();
      form.hidden = true;
      document.querySelector('.track').hidden = true;
      document.getElementById('resultFolio').textContent = folio;
      resultOk.hidden = false;
    })
    .catch(function(){
      hideSending();
      submitBtn.disabled = false;
      resultError.hidden = false;
      resultError.scrollIntoView({ behavior:'smooth' });
    });
  });

  retryBtn.addEventListener('click', function(){
    resultError.hidden = true;
    form.dispatchEvent(new Event('submit', { cancelable:true }));
  });

})();
