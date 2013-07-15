var $lastFocused;

// set up tracking of last focused password box
$(document).on('focus', 'input[type=password]', function(e) {
    var $passBox = $(e.target);
    console.log(e.target);
    $lastFocused = $passBox;
});

function getPassField() {
    var $passBoxes = $("input[type=password]").filter(':visible');
    var len = $passBoxes.length;
    console.log('number of passboxes', len);
    if(len === 1) {
        return $passBoxes.first();
    } else {
        return $lastFocused;
    }
}

function extractActionDomain(action) {
    var matches = action.match(/^(https?:)?\/\/(.+?)(\/|$)/);
    if(!matches || matches.length < 3) {
        return;
    }

    var host = matches[2];
    if(!host) {
        return;
    }

    var parts = host.split('.');
    if(parts.length < 2) {
        return;
    }

    return extractDomain(host);
}

function extractDomain(host) {
    var s;  // the final result

    host = host.split(':')[0]; // strip out port

    // Begin Chris Zarate's code
    host=host.split('.');

    if(host.length >= 3) {
      s=host[host.length-2]+'.'+host[host.length-1];
      domains='ab.ca|ac.ac|ac.at|ac.be|ac.cn|ac.il|ac.in|ac.jp|ac.kr|ac.nz|ac.th|ac.uk|ac.za|adm.br|adv.br|agro.pl|ah.cn|aid.pl|alt.za|am.br|arq.br|art.br|arts.ro|asn.au|asso.fr|asso.mc|atm.pl|auto.pl|bbs.tr|bc.ca|bio.br|biz.pl|bj.cn|br.com|cn.com|cng.br|cnt.br|co.ac|co.at|co.il|co.in|co.jp|co.kr|co.nz|co.th|co.uk|co.za|com.au|com.br|com.cn|com.ec|com.fr|com.hk|com.mm|com.mx|com.pl|com.ro|com.ru|com.sg|com.tr|com.tw|cq.cn|cri.nz|de.com|ecn.br|edu.au|edu.cn|edu.hk|edu.mm|edu.mx|edu.pl|edu.tr|edu.za|eng.br|ernet.in|esp.br|etc.br|eti.br|eu.com|eu.lv|fin.ec|firm.ro|fm.br|fot.br|fst.br|g12.br|gb.com|gb.net|gd.cn|gen.nz|gmina.pl|go.jp|go.kr|go.th|gob.mx|gov.br|gov.cn|gov.ec|gov.il|gov.in|gov.mm|gov.mx|gov.sg|gov.tr|gov.za|govt.nz|gs.cn|gsm.pl|gv.ac|gv.at|gx.cn|gz.cn|hb.cn|he.cn|hi.cn|hk.cn|hl.cn|hn.cn|hu.com|idv.tw|ind.br|inf.br|info.pl|info.ro|iwi.nz|jl.cn|jor.br|jpn.com|js.cn|k12.il|k12.tr|lel.br|ln.cn|ltd.uk|mail.pl|maori.nz|mb.ca|me.uk|med.br|med.ec|media.pl|mi.th|miasta.pl|mil.br|mil.ec|mil.nz|mil.pl|mil.tr|mil.za|mo.cn|muni.il|nb.ca|ne.jp|ne.kr|net.au|net.br|net.cn|net.ec|net.hk|net.il|net.in|net.mm|net.mx|net.nz|net.pl|net.ru|net.sg|net.th|net.tr|net.tw|net.za|nf.ca|ngo.za|nm.cn|nm.kr|no.com|nom.br|nom.pl|nom.ro|nom.za|ns.ca|nt.ca|nt.ro|ntr.br|nx.cn|odo.br|on.ca|or.ac|or.at|or.jp|or.kr|or.th|org.au|org.br|org.cn|org.ec|org.hk|org.il|org.mm|org.mx|org.nz|org.pl|org.ro|org.ru|org.sg|org.tr|org.tw|org.uk|org.za|pc.pl|pe.ca|plc.uk|ppg.br|presse.fr|priv.pl|pro.br|psc.br|psi.br|qc.ca|qc.com|qh.cn|re.kr|realestate.pl|rec.br|rec.ro|rel.pl|res.in|ru.com|sa.com|sc.cn|school.nz|school.za|se.com|se.net|sh.cn|shop.pl|sk.ca|sklep.pl|slg.br|sn.cn|sos.pl|store.ro|targi.pl|tj.cn|tm.fr|tm.mc|tm.pl|tm.ro|tm.za|tmp.br|tourism.pl|travel.pl|tur.br|turystyka.pl|tv.br|tw.cn|uk.co|uk.com|uk.net|us.com|uy.com|vet.br|web.za|web.com|www.ro|xj.cn|xz.cn|yk.ca|yn.cn|za.com';
      domains=domains.split('|');
      for(var i=0;i<domains.length;i++) {
        if(s==domains[i]) {
          s=host[host.length-3]+'.'+s;
          break;
        }
      }
    } else {
      s=host.join('.');
    }
    // End Chris Zarate's code
    return s;
}

function getDomain($form) {
    var action = $form.attr('action');

    // try to get domain from action
    if(action) {
        var actionDomain = extractActionDomain(action);
        if(actionDomain) {
            return actionDomain;
        }
    }

    // try to get domain from location
    return extractDomain(location.host);
}

function getFormInfo(request, cb) {
    var $passBox = getPassField();
    if(!$passBox) {
        cb();
        return;
    }

    $passBox.addClass('psychopass-highlighted');

    var $form = $passBox.parents('form');
    var domain = getDomain($form);
    console.log('domain', domain);

    console.log('sending response');
    cb({domain: domain});
}

function setPassword(request, cb) {
    $('.psychopass-highlighted').removeClass('psychopass-highlighted');

    var $passField = getPassField();
    if(!$passField) {
        return;
    }

    console.log('password!', request.password);

    $passField.val(request.password);
    $passField.focus();
    cb();
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('message', request.mtype, sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
    var FUNC_MAP = {
        getFormInfo: getFormInfo,
        insertPasswords: setPassword,
    };

    var f = FUNC_MAP[request.mtype];
    if(f) {
        f(request, sendResponse);
    }
});
