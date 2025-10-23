/*
    The MIT License (MIT)
    Copyright (c) 2025 soundinspire #9
    (License text omitted for brevity)
*/

/* MV_Opacity_Controller v29N (v14 - Tooltip Removed)
    - v10: buildExpression (マーカー有無問わずフェード適用) (ID: 36)
    - v13: applyBtn.onClick の mode 判定ロジックを if/else に修正 (ID: 50)
    - v14: マーカー全削除ボタンを追加 (ID: 52)
    - v14: ツールチップ(showHelpCb)と関連パネルを削除 (ID: 61)
*/
(function () {
    var S = "SI_MVOpacityCtrl"; // app.settings section

    // --- プリセット関数 (変更なし) ---
    function savePreset(name, obj) { try { for (var k in obj) app.settings.saveSetting(S + "_" + name, k, String(obj[k])); app.settings.saveSetting(S, "lastPreset", name); return true; } catch (e) { alert("プリセットの保存に失敗しました: " + e); return false; } }
    function loadPreset(name, def) { var out = {}; for (var k in def) { var sec = S + "_" + name; if (app.settings.haveSetting(sec, k)) { var v = app.settings.getSetting(sec, k); out[k] = (v === "true") ? true : (v === "false") ? false : (isNaN(Number(v)) ? v : Number(v)); } else out[k] = def[k]; } return out; }
    function listPresets() {
        var defaultPresets = ["デフォルト", "ソフト (イン/アウト)", "スナッピー (イン)", "ホールド"];
        if (app.settings.haveSetting(S, "presetNames")) {
            try {
                var savedNames = JSON.parse(app.settings.getSetting(S, "presetNames"));
                var allNames = defaultPresets.concat(savedNames);
                var uniqueNames = allNames.filter(function(item, pos) {
                    return allNames.indexOf(item) == pos;
                });
                return uniqueNames;
            } catch (e) {
                return defaultPresets;
            }
        }
        return defaultPresets;
    }
    
    // --- ウィンドウ作成 ---
    var win = new Window("palette", "MV 不透明度コントローラー v29N (v14)", undefined, { resizeable: true });
    win.orientation = "column"; win.alignChildren = "fill"; win.spacing = 10; win.margins = 12;

    // --- UIセクション (タブUI構成に変更) ---

    // --- 1. 共通エリア (上部) ---
    var selPanel = win.add("panel", undefined, "選択ヘルパー");
    selPanel.orientation = "column"; selPanel.alignChildren = "fill"; selPanel.margins = 10; selPanel.spacing = 8;
    var rowName = selPanel.add("group");
    rowName.add("statictext", undefined, "レイヤー名に以下を含む:");
    var nameEt = rowName.add("edittext", undefined, ""); nameEt.characters = 18;
    var btnByName = rowName.add("button", undefined, "名前で選択");
    var rowOpts = selPanel.add("group");
    var btnSameLabel = rowOpts.add("button", undefined, "同じラベル色を選択");
    var btnCopyMarkers = rowOpts.add("button", undefined, "マーカーをコピー");
    var btnDeleteMarkers = rowOpts.add("button", undefined, "マーカー全削除");
    
    // --- 2. タブパネル ---
    var tabPanel = win.add("tabbedpanel");
    tabPanel.alignChildren = "fill";

    // --- タブ1: メイン制御 ---
    var tabMain = tabPanel.add("tab", undefined, "メイン制御");
    tabMain.orientation = "column"; tabMain.alignChildren = "fill"; tabMain.spacing = 6; tabMain.margins = 8;
    
    var p = tabMain.add("panel", undefined, "エクスプレッションフェード & 制御");
    p.orientation = "column"; p.alignChildren = "left"; p.margins = 10; p.spacing = 6;
    var row1 = p.add("group");
    row1.add("statictext", undefined, "最大不透明度 (%)"); 
    var maxSlider = row1.add("slider", undefined, 100, 1, 100); maxSlider.preferredSize.width = 200;
    var maxText = row1.add("statictext", undefined, "100");
    maxSlider.onChanging = function(){ maxText.text = String(Math.round(maxSlider.value)); };
    var noFadeCb = p.add("checkbox", undefined, "フェードなし");
    var row2 = p.add("group");
    row2.add("statictext", undefined, "フェードイン (秒)");
    var inSlider = row2.add("slider", undefined, 0.50, 0.01, 2.0); inSlider.preferredSize.width = 200;
    var inText = row2.add("statictext", undefined, "0.50");
    inSlider.onChanging = function(){ inText.text = inSlider.value.toFixed(2); };
    var row3 = p.add("group");
    row3.add("statictext", undefined, "フェードアウト (秒)");
    var outSlider = row3.add("slider", undefined, 0.50, 0.01, 2.0); outSlider.preferredSize.width = 200;
    var outText = row3.add("statictext", undefined, "0.50");
    outSlider.onChanging = function(){ outText.text = outSlider.value.toFixed(2); };
    var row4 = p.add("group");
    row4.add("statictext", undefined, "フェードの種類:");
    var linearRb = row4.add("radiobutton", undefined, "リニア");
    var easeRb = row4.add("radiobutton", undefined, "イーズ"); easeRb.value = true;
    var row5 = p.add("group");
    row5.add("statictext", undefined, "適用範囲:");
    var inOnly = row5.add("radiobutton", undefined, "インのみ");
    var outOnly = row5.add("radiobutton", undefined, "アウトのみ");
    var both = row5.add("radiobutton", undefined, "両方"); both.value = true;
    
    var mPanel = tabMain.add("panel", undefined, "マーカー制御 (エクスプレッション)");
    mPanel.orientation = "row"; mPanel.alignChildren = "center"; mPanel.margins = 10; mPanel.spacing = 5;
    var useEaseCb = mPanel.add("checkbox", undefined, "マーカー間にイーズを適用");
    mPanel.add("statictext", undefined, "|");
    var btnOn = mPanel.add("button", undefined, "on"); btnOn.preferredSize.width = 40;
    var btnOff = mPanel.add("button", undefined, "off"); btnOff.preferredSize.width = 40;
    var btnHold = mPanel.add("button", undefined, "hold"); btnHold.preferredSize.width = 45;
    var btnFade = mPanel.add("button", undefined, "fade:"); btnFade.preferredSize.width = 50;
    var fadeEt = mPanel.add("edittext", undefined, "1.5"); fadeEt.preferredSize.width = 40;

    // --- タブ2: ツール ---
    var tabTools = tabPanel.add("tab", undefined, "ツール");
    tabTools.orientation = "column"; tabTools.alignChildren = "fill"; tabTools.spacing = 6; tabTools.margins = 8;
    
    var bpmPanel = tabTools.add("panel", undefined, "BPM同期マーカー");
    bpmPanel.orientation = "row"; bpmPanel.alignChildren = "center"; bpmPanel.margins = 10; bpmPanel.spacing = 5;
    bpmPanel.add("statictext", undefined, "BPM:");
    var bpmEt = bpmPanel.add("edittext", undefined, "120"); bpmEt.preferredSize.width = 40;
    bpmPanel.add("statictext", undefined, "拍子:");
    var beatDd = bpmPanel.add("dropdownlist", undefined, ["4分", "8分", "16分", "2分", "1小節"]); beatDd.selection = 0;
    var createBpmMarkersBtn = bpmPanel.add("button", undefined, "BPMマーカー作成");

    var kfFadePanel = tabTools.add("panel", undefined, "キーフレームフェード");
    kfFadePanel.orientation = "row"; kfFadePanel.alignChildren = ["left", "center"]; kfFadePanel.margins = 10; kfFadePanel.spacing = 8;
    kfFadePanel.add("statictext", undefined, "フェード時間 (フレーム):");
    var fadeFramesEt = kfFadePanel.add("edittext", undefined, "15"); fadeFramesEt.characters = 4;
    var createFadeInBtn = kfFadePanel.add("button", undefined, "フェードイン作成");
    var createFadeOutBtn = kfFadePanel.add("button", undefined, "フェードアウト作成");
    
    // --- タブ3: ベイク ---
    var tabBake = tabPanel.add("tab", undefined, "ベイク");
    tabBake.orientation = "column"; tabBake.alignChildren = "fill"; tabBake.spacing = 6; tabBake.margins = 8;

    var bPanel = tabBake.add("panel", undefined, "ベイク (エクスプレッション → キーフレーム)");
    bPanel.orientation = "row"; bPanel.alignChildren = ["left","center"]; bPanel.margins = 10; bPanel.spacing = 10;
    bPanel.add("statictext", undefined, "レート (fps)");
    var fpsDd = bPanel.add("dropdownlist", undefined, ["1","2","4","8","12","24","30","60"]); fpsDd.selection = 2;
    var spCb = bPanel.add("checkbox", undefined, "キーフレームを間引く");
    var thrEt = bPanel.add("edittext", undefined, "1.0"); thrEt.characters = 4;
    bPanel.add("statictext", undefined, "% しきい値");
    

    // --- 3. 共通エリア (下部) ---
    var actGrp = win.add("group"); actGrp.alignment = "fill";
    var applyBtn = actGrp.add("button", undefined, "エクスプレッションを適用");
    var bakeBtn  = actGrp.add("button", undefined, "エクスプレッションをベイク");
    
    var prPanel = win.add("panel", undefined, "プリセット");
    prPanel.orientation = "row"; prPanel.alignChildren = ["left","center"]; prPanel.margins = 10; prPanel.spacing = 8;
    var prDd = prPanel.add("dropdownlist", undefined, listPresets()); prDd.selection = 0;
    var prLoad = prPanel.add("button", undefined, "読み込み");
    var prSave = prPanel.add("button", undefined, "別名で保存...");
    
    // ★ ツールチップ関連のパネル(settingsPanel)とチェックボックス(showHelpCb)を削除 (ID: 61)
    
    
    // --- Functions (v29Mから変更なし) ---

    // BPMマーカー作成関数
    function createBpmMarkers() {
        var comp = app.project.activeItem;
        if (!(comp && comp instanceof CompItem)) {
            alert("コンポジションを開いてください。");
            return;
        }
        var layers = comp.selectedLayers;
        if (layers.length === 0) {
            alert("マーカーを追加するレイヤーを選択してください。");
            return;
        }
        
        var bpm = parseFloat(bpmEt.text);
        if (isNaN(bpm) || bpm <= 0) {
            alert("BPMには正の数値を入力してください。");
            return;
        }
        
        var beatSelection = beatDd.selection.text;
        var beatValue = 1; // 4分音符
        switch (beatSelection) {
            case "8分": beatValue = 0.5; break;
            case "16分": beatValue = 0.25; break;
            case "2分": beatValue = 2; break;
            case "1小節": beatValue = 4; break; // 4/4拍子を想定
        }
        
        var beatDurationSec = (60.0 / bpm) * beatValue;
        var startTime = comp.time;

        app.beginUndoGroup("BPMマーカー作成");
        try {
            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];
                var markerProp = layer.property("Marker");
                if (!markerProp) continue;

                var t = startTime;
                if (beatDurationSec > 0) {
                     while(t < layer.inPoint && t < startTime) {
                         t += beatDurationSec;
                     }
                     if (t < layer.inPoint) {
                          var beatsToInPoint = Math.floor((layer.inPoint - t) / beatDurationSec);
                          t += (beatsToInPoint + 1) * beatDurationSec;
                     }
                }
               
                while (t <= layer.outPoint + 1e-5) { 
                    if (t >= layer.inPoint - 1e-5) {
                        var newMarker = new MarkerValue(""); 
                        markerProp.setValueAtTime(t, newMarker);
                    }
                    if (beatDurationSec <= 0) break; 
                    t += beatDurationSec;
                }
            }
        } catch(e) {
            alert("BPMマーカーの作成中にエラーが発生しました:\n" + e.toString());
        } finally {
            app.endUndoGroup();
        }
    }
    
    // マーカー全削除関数 (ID: 52)
    function deleteMarkers() {
        var comp = app.project.activeItem;
        if (!(comp && comp instanceof CompItem)) {
            alert("コンポジションを開いてください。");
            return;
        }
        var layers = comp.selectedLayers;
        if (layers.length === 0) {
            alert("マーカーを削除するレイヤーを選択してください。");
            return;
        }

        app.beginUndoGroup("選択レイヤーのマーカーを全削除");
        try {
            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];
                var markerProp = layer.property("Marker");
                // マーカープロパティがあり、キーが1つ以上ある場合のみ処理
                if (markerProp && markerProp.numKeys > 0) {
                    // キーがなくなるまで1番目のキーを削除し続ける
                    while (markerProp.numKeys > 0) {
                        markerProp.removeKey(1);
                    }
                }
            }
        } catch(e) {
            alert("マーカーの削除中にエラーが発生しました:\n" + e.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    // マーカーコピー関数
    function copyMarkersFromBase() {
        var comp = app.project.activeItem;
        if (!(comp && comp instanceof CompItem)) {
            alert("コンポジションを開いてください。");
            return;
        }
        var layers = comp.selectedLayers;
        if (layers.length < 2) {
            alert("基準となるレイヤー1つと、コピー先のレイヤー1つ以上を選択してください。\n(最初に選択したレイヤーが基準になります)");
            return;
        }
        
        var sourceLayer = layers[0];
        var sourceMarkerProp = sourceLayer.property("Marker");
        if (!sourceMarkerProp || sourceMarkerProp.numKeys === 0) {
            alert("基準レイヤーにマーカーがありません。");
            return;
        }

        var sourceMarkers = [];
        for (var i = 1; i <= sourceMarkerProp.numKeys; i++) {
            var keyTime = sourceMarkerProp.keyTime(i);
            var keyValue = sourceMarkerProp.keyValue(i);
            sourceMarkers.push({
                time: keyTime,
                comment: keyValue.comment,
                duration: keyValue.duration,
                chapter: keyValue.chapter,
                url: keyValue.url,
                frameTarget: keyValue.frameTarget
            });
        }

        app.beginUndoGroup("マーカーをコピー");
        try {
            for (var i = 1; i < layers.length; i++) {
                var targetLayer = layers[i];
                var targetMarkerProp = targetLayer.property("Marker");
                if (!targetMarkerProp) continue;

                while (targetMarkerProp.numKeys > 0) {
                    targetMarkerProp.removeKey(1);
                }

                for (var j = 0; j < sourceMarkers.length; j++) {
                    var sourceMarker = sourceMarkers[j];
                    var relativeTime = sourceMarker.time - sourceLayer.inPoint;
                    var targetTime = targetLayer.inPoint + relativeTime;

                    if (targetTime >= targetLayer.inPoint - 1e-5 && targetTime <= targetLayer.outPoint + 1e-5) {
                        var newMarker = new MarkerValue(sourceMarker.comment);
                        newMarker.duration = sourceMarker.duration;
                        newMarker.chapter = sourceMarker.chapter;
                        newMarker.url = sourceMarker.url;
                        newMarker.frameTarget = sourceMarker.frameTarget;
                        targetMarkerProp.setValueAtTime(targetTime, newMarker);
                    }
                }
            }
        } catch(e) {
            alert("マーカーのコピー中にエラーが発生しました:\n" + e.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    // コメント付きマーカー追加関数
    function addMarkerWithComment(comment) {
        var comp = app.project.activeItem; 
        if (!(comp && comp instanceof CompItem)) { 
            alert("コンポジションを開いてください。"); 
            return; 
        }
        var layers = comp.selectedLayers; 
        if (layers.length === 0) { 
            alert("マーカーを追加するレイヤーを選択してください。"); 
            return; 
        }
        app.beginUndoGroup("マーカーを追加: " + comment);
        try {
            var compTime = comp.time;
            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];
                var markerProp = layer.property("Marker");
                var newMarker = new MarkerValue(comment);
                markerProp.setValueAtTime(compTime, newMarker);
            }
        } catch(e) { 
            alert("マーカーの追加中にエラーが発生しました:\n" + e.toString()); 
        } finally { 
            app.endUndoGroup(); 
        }
    }

    // イベントハンドラ接続
    btnOn.onClick = function() { addMarkerWithComment("on"); };
    btnOff.onClick = function() { addMarkerWithComment("off"); };
    btnHold.onClick = function() { addMarkerWithComment("hold"); };
    btnFade.onClick = function() {
        var fadeVal = parseFloat(fadeEt.text);
        if (isNaN(fadeVal) || fadeVal < 0) { 
            alert("fadeの秒数には正の数値を入力してください。"); 
            return; 
        }
        addMarkerWithComment("fade:" + fadeVal);
    };
    createBpmMarkersBtn.onClick = createBpmMarkers; 
    btnCopyMarkers.onClick = copyMarkersFromBase;
    btnDeleteMarkers.onClick = deleteMarkers; 

    // プロパティ取得ヘルパー
    function getOpacityProp(layer){ 
        return layer.property("ADBE Transform Group") && layer.property("ADBE Transform Group").property("ADBE Opacity"); 
    }

// エクスプレッション構築 (v29N改 v10：常時フェード適用ロジック v5改) (ID: 36)
    function buildExpression(maxOpacity, fadeIn, fadeOut, fadeType, fadeMode, useEaseMarker, noFade){
        
        var fadeFuncStr = (fadeType === "linear") 
            ? "linear(t, tMin, tMax, val1, val2)" 
            : "ease(t, tMin, tMax, val1, val2)";
        
        var expressionLines = [
            "// MV Opacity Controller v29N (Fade Logic Fixed v10 - Always Fade Logic)",
            "var maxOpacity = " + maxOpacity + ";",
            "var useEaseMarker = " + useEaseMarker + ";",
            "var m = thisLayer.marker;",
            "",
            "// ★ デフォルト値を maxOpacity に設定 (v3/v9と同じ)",
            "var finalVal = maxOpacity;", 
            "",
            "function ez(t, tMin, tMax, val1, val2) { try { return ease(t, tMin, tMax, val1, val2); } catch(e) { return val1; } }",
            "function layerFade(t, tMin, tMax, val1, val2) { try { return " + fadeFuncStr + "; } catch(e) { return val1; } }",
            "",
            "var currentSegmentStartIndex = 0;",
            "if (m.numKeys > 0) {",
            "    try {",
            "        var nearestKey = m.nearestKey(time);",
            "        currentSegmentStartIndex = nearestKey.index;",
            "        if (nearestKey.time > time) {",
            "            currentSegmentStartIndex--;",
            "        }",
            "    } catch(e) {}",
            "",
            "    // ★ v5の「finalVal = 0;」(バグの原因)を削除。",
            "    // ★ マーカーありでも、先頭区間はデフォルト(maxOpacity)のままにする。",
            "    if (currentSegmentStartIndex == 0) {",
            "         // (何もしない。finalVal は maxOpacity のまま)",
            "    }",
            "}",
            "",
            "// --- 1. マーカーに基づく基本値 (finalVal) の決定 ---",
            "// (マーカーがなければ finalVal = maxOpacity のまま)",
            "if (currentSegmentStartIndex > 0) {",
            "    var calcStartIndex = 0;",
            "    for (var i = currentSegmentStartIndex; i > 0; i--) {",
            "        if (m.key(i).comment.toLowerCase().indexOf('hold') === -1) {",
            "            calcStartIndex = i;",
            "            break;",
            "        }",
            "    }",
            "",
            "    var calcEndIndex = 0;",
            "    if (calcStartIndex > 0) {",
            "        for (var i = calcStartIndex + 1; i <= m.numKeys; i++) {",
            "            if (m.key(i).comment.toLowerCase().indexOf('hold') === -1) {",
            "                calcEndIndex = i;",
            "                break;",
            "            }",
            "        }",
            "    }",
            "",
            "    var holdMarkerTime = -1;",
            "    if (calcStartIndex > 0) {",
            "        var currentMarker = m.key(currentSegmentStartIndex);",
            "        if (currentMarker.comment.toLowerCase().indexOf('hold') !== -1) {",
            "            holdMarkerTime = currentMarker.time;",
            "        }",
            "    }",
            "",
            "    if (calcStartIndex > 0) {",
            "        var startMarker = m.key(calcStartIndex);",
            "        var startComment = startMarker.comment.toLowerCase();",
            "        var t1 = startMarker.time;",
            "        var t2 = (calcEndIndex > 0) ? m.key(calcEndIndex).time : thisLayer.outPoint;",
            "",
            "        var timeForCalc = (holdMarkerTime !== -1) ? holdMarkerTime : time;",
            "",
            "        if (startComment.indexOf('off') !== -1) {",
            "            finalVal = 0;",
            "        } else if (startComment.indexOf('on') !== -1) {",
            "            finalVal = maxOpacity;",
            "        } else if (startComment.indexOf('fade:') !== -1) {",
            "            var fadeDuration = parseFloat(startComment.split(':')[1]);",
            "            if (isNaN(fadeDuration) || fadeDuration <= 0) fadeDuration = 0.5;",
            "            var tFadeEnd = t1 + fadeDuration;",
            "            if (timeForCalc < tFadeEnd) {",
            "                finalVal = ez(timeForCalc, t1, tFadeEnd, maxOpacity, 0);",
            "            } else {",
            "                finalVal = 0;",
            "            }",
            "        } else { // Handle comment-less markers",
            "            if (useEaseMarker) {",
            "                if (t1 >= t2) {",
            "                    finalVal = 0;",
            "                } else {",
            "                    var midPoint = t1 + (t2 - t1) / 2;",
            "                    if (timeForCalc <= midPoint) {",
            "                        finalVal = ez(timeForCalc, t1, midPoint, 0, maxOpacity);",
            "                    } else {",
            "                        finalVal = ez(timeForCalc, midPoint, t2, maxOpacity, 0);",
            "                    }",
            "                }",
            "            } else {",
            "                finalVal = (calcStartIndex % 2 !== 0) ? maxOpacity : 0;",
            "            }",
            "        }",
            "    }",
            "}",
            "",
            "// --- 2. レイヤーのイン/アウトに基づくフェード処理 (v5 シンプルロジック) ---",
            "// finalVal (マーカーなしなら100, マーカーありならマーカーの値) に対してフェードを適用",
            "var fadeVal = finalVal;",
            "if (!" + noFade + ") {",
            "    var tIn = inPoint + " + fadeIn + ";",
            "    var tOut = outPoint - " + fadeOut + ";",
            "",
            "    if (" + (fadeMode === "in" || fadeMode === "both") + " && time < tIn && time >= inPoint) {",
            "        fadeVal = layerFade(time, inPoint, tIn, 0, finalVal);",
            "    } else if (" + (fadeMode === "out" || fadeMode === "both") + " && time > tOut && time <= outPoint) {",
            "        fadeVal = layerFade(time, tOut, outPoint, finalVal, 0);",
            "    }",
            "}",
            "",
            "// --- 3. 最終値の出力 ---",
            "clamp(fadeVal, 0, maxOpacity);",
        ];
        
        return expressionLines.join("\n");
    }
    
    // 適用ボタン (ID: 50 の v13 修正適用済み)
    applyBtn.onClick = function() {
        var comp = app.project.activeItem; 
        if (!(comp && comp instanceof CompItem)) { 
            alert("コンポジションを開いてください。"); 
            return; 
        }
        var layers = comp.selectedLayers; 
        if (layers.length === 0) { 
            alert("レイヤーを選択してください。"); 
            return; 
        }
        if (!warnOverwrite(layers)) return;
        
        var maxOpacity = Math.round(maxSlider.value); 
        var fadeIn = Number(inSlider.value.toFixed(3));
        var fadeOut = Number(outSlider.value.toFixed(3)); 
        var fadeType = (linearRb.value ? "linear" : "ease");
        
        // ★ v13 修正: if/else で mode を確実に判定
        var mode = "both"; // デフォルト
        if (inOnly.value) {
            mode = "in";
        } else if (outOnly.value) {
            mode = "out";
        }
        
        var useEase = useEaseCb.value;
        var noFade = noFadeCb.value;
        
        var expr = buildExpression(maxOpacity, fadeIn, fadeOut, fadeType, mode, useEase, noFade);
        
        app.beginUndoGroup("不透明度制御を適用");
        for (var i = 0; i < layers.length; i++) {
            var L = layers[i], op = getOpacityProp(L);
            if (!op || !op.canSetExpression) { continue; }
            op.expression = expr;
        }
        app.endUndoGroup();
    };
    
    // 上書き警告
    function warnOverwrite(layers){
        var hit = []; 
        for (var i=0;i<layers.length;i++){ 
            var op = getOpacityProp(layers[i]); 
            if(op && op.canSetExpression && op.expression!=="") 
                hit.push(layers[i].name); 
        }
        if(hit.length>0){ 
            return confirm("これらのレイヤーには既に不透明度のエクスプレッションが存在します:\n\n"+hit.join("\n")+"\n\nすべて上書きしますか?"); 
        }
        return true;
    }
    
    // Shiftキー判定
    function shouldReplace(defaultReplace) { 
        try { 
            var ks = ScriptUI.environment.keyboardState; 
            if (ks && ks.shiftKey) return !defaultReplace; 
        } catch(e){} 
        return defaultReplace; 
    }
    
    // 名前で選択
    btnByName.onClick = function(){
        var c = app.project.activeItem; 
        if(!(c && c instanceof CompItem)) { 
            alert("コンポジションを開いてください。"); 
            return; 
        }
        var q = nameEt.text||""; 
        if(!q) return;
        var replace = shouldReplace(true);
        if (replace){ 
            for (var i=1;i<=c.numLayers;i++) 
                c.layer(i).selected = false; 
        }
        for (var i=1;i<=c.numLayers;i++){ 
            var L=c.layer(i); 
            if(String(L.name).indexOf(q)>=0) 
                L.selected = true; 
        }
    };
    
    // ラベルで選択
    btnSameLabel.onClick = function(){
        var c = app.project.activeItem; 
        if(!(c && c instanceof CompItem)){ 
            alert("コンポジションを開いてください。"); 
            return; 
        }
        var sel = c.selectedLayers; 
        if(sel.length===0){ 
            alert("まず基準にするレイヤーを1つ選択してください。"); 
            return; 
        }
        var idx = sel[0].label;
        var add = shouldReplace(false);
        if (!add){ 
            for (var j=1;j<=c.numLayers;j++) 
                c.layer(j).selected = false; 
        }
        for (var i=1;i<=c.numLayers;i++){ 
            var L=c.layer(i); 
            if(L.label===idx) 
                L.selected = true; 
        }
    };
    
    // フェードなし チェックボックス
    noFadeCb.onClick = function(){ 
        var isEnabled = !this.value; 
        row2.enabled = isEnabled; 
        row3.enabled = isEnabled; 
        row4.enabled = isEnabled; 
        row5.enabled = isEnabled; 
    };
    
    // キーフレームフェード ボタン
    createFadeInBtn.onClick = function() { createKeyframeFade("in"); };
    createFadeOutBtn.onClick = function() { createKeyframeFade("out"); };
    
    // プリセット読み込み
    prLoad.onClick = function(){
        var def = {max:100,inT:0.5,outT:0.5,type:"ease",mode:"both",noFade:false,useEase:false,rate:4,sparsify:false,thr:1.0};
        var p = loadPreset(prDd.selection.text, def);
        maxSlider.value=p.max; 
        maxText.text=String(p.max); 
        noFadeCb.value = !!p.noFade; 
        noFadeCb.onClick();
        inSlider.value=p.inT; 
        inText.text=p.inT.toFixed(2); 
        outSlider.value=p.outT; 
        outText.text=p.outT.toFixed(2);
        linearRb.value=(p.type==="linear"); 
        easeRb.value=(p.type!=="linear"); 
        inOnly.value=(p.mode==="in"); 
        outOnly.value=(p.mode==="out"); 
        both.value=(p.mode==="both");
        useEaseCb.value=!!p.useEase; 
        var idx = Math.max(0, ["1","2","4","8","12","24","30","60"].indexOf(String(p.rate)));
        fpsDd.selection = idx; 
        spCb.value = !!p.sparsify; 
        thrEt.text = String(p.thr);
    };
    
    // プリセット保存
    prSave.onClick = function(){
        var name = prompt("プリセット名", "マイプリセット"); 
        if(!name) return;
        
        var obj = {
            max: Math.round(maxSlider.value),
            inT: Number(inSlider.value.toFixed(2)),
            outT: Number(outSlider.value.toFixed(2)),
            type: linearRb.value ? "linear" : "ease",
            mode: inOnly.value ? "in" : outOnly.value ? "out" : "both",
            noFade: noFadeCb.value,
            useEase: useEaseCb.value,
            rate: Number(fpsDd.selection.text),
            sparsify: spCb.value,
            thr: Number(thrEt.text)
        };
        
        var ok = savePreset(name, obj);

        if(ok){
            var currentNames = listPresets();
            if (currentNames.indexOf(name) === -1) {
                currentNames.push(name);
            }
            var defaultPresets = ["デフォルト", "ソフト (イン/アウト)", "スナッピー (イン)", "ホールド"];
            var customNames = currentNames.filter(function(n) { 
                return defaultPresets.indexOf(n) === -1; 
            });
            app.settings.saveSetting(S, "presetNames", JSON.stringify(customNames));
            
            prDd.removeAll();
            var allPresets = listPresets();
            for(var i = 0; i < allPresets.length; i++) {
                prDd.add("item", allPresets[i]);
            }
            prDd.selection = prDd.find(name);

            alert("プリセットを保存しました: " + name);
        }
    };
    
    // ベイクボタン
    bakeBtn.onClick = function(){
        var comp = app.project.activeItem; 
        if(!(comp && comp instanceof CompItem)){ 
            alert("コンポジションを開いてください。"); 
            return; 
        }
        var layers = comp.selectedLayers; 
        if(layers.length===0){ 
            alert("レイヤーを選択してください。"); 
            return; 
        }
        var thrVal = Number(thrEt.text); 
        if (isNaN(thrVal)) { 
            alert("エラー: しきい値には有効な数値を入力してください。"); 
            return; 
        }
        var fps = Number(fpsDd.selection.text); 
        var thr = (spCb.value? Math.max(0, thrVal) : 0);
        
        app.beginUndoGroup("不透明度をベイク (すべて)");
        for (var i=0;i<layers.length;i++) 
            bakeOpacity(layers[i], fps, thr);
        app.endUndoGroup();
        
        alert(layers.length+"個のレイヤーをベイクしました。");
    };
    
    // キーフレームフェード作成
    function createKeyframeFade(type) {
        var comp = app.project.activeItem; 
        if (!(comp && comp instanceof CompItem)) { 
            alert("コンポジションを開いてください。"); 
            return; 
        }
        var layers = comp.selectedLayers; 
        if (layers.length === 0) { 
            alert("レイヤーを選択してください。"); 
            return; 
        }
        var fadeFrames = parseInt(fadeFramesEt.text); 
        if (isNaN(fadeFrames) || fadeFrames <= 0) { 
            alert("エラー: フェード時間には正の整数を入力してください。"); 
            return; 
        }
        
        app.beginUndoGroup("キーフレームフェード作成 (" + type + ")");
        try {
            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i]; 
                var op = getOpacityProp(layer); 
                if (!op || !op.canVaryOverTime) continue;
                
                var frameDur = comp.frameDuration; 
                var fadeDurSec = fadeFrames * frameDur;
                var linearEase = new KeyframeEase(0, 0.1); 
                var strongEase = new KeyframeEase(0, 75);
                
                if (type === "in") {
                    if (layer.inPoint + fadeDurSec > layer.outPoint) { 
                        fadeDurSec = layer.outPoint - layer.inPoint; 
                    }
                    var t1_in = layer.inPoint; 
                    var t2_in = t1_in + fadeDurSec;
                    op.setValueAtTime(t1_in, 0); 
                    op.setValueAtTime(t2_in, 100);
                    var k1_in_idx = op.nearestKeyIndex(t1_in); 
                    var k2_in_idx = op.nearestKeyIndex(t2_in);
                    op.setTemporalEaseAtKey(k1_in_idx, [linearEase], [strongEase]);
                    op.setTemporalEaseAtKey(k2_in_idx, [linearEase], [linearEase]);
                } else if (type === "out") {
                    if (layer.outPoint - fadeDurSec < layer.inPoint) { 
                        fadeDurSec = layer.outPoint - layer.inPoint; 
                    }
                    var t1_out = layer.outPoint - fadeDurSec; 
                    var t2_out = layer.outPoint;
                    op.setValueAtTime(t1_out, 100); 
                    op.setValueAtTime(t2_out, 0);
                    var k1_out_idx = op.nearestKeyIndex(t1_out); 
                    var k2_out_idx = op.nearestKeyIndex(t2_out);
                    op.setTemporalEaseAtKey(k1_out_idx, [linearEase], [linearEase]);
                    op.setTemporalEaseAtKey(k2_out_idx, [strongEase], [linearEase]);
                }
            }
        } catch(e) { 
            alert("キーフレームフェード作成中にエラーが発生しました:\n" + e.toString()); 
        } finally { 
            app.endUndoGroup(); 
        }
    }
    
    // ベイク関数
    function bakeOpacity(layer, fps, thrPct){
        var op = getOpacityProp(layer); 
        if(!op) return;
        
        var hadExpr = (op.canSetExpression && op.expression!=="");
        var t0 = layer.inPoint, t1 = layer.outPoint;
        var dt = 1/Math.max(1, fps);
        
        app.beginUndoGroup("不透明度をベイク");
        try{
            if(hadExpr) op.expressionEnabled = true;
            while(op.numKeys>0) op.removeKey(1);
            
            for (var t=t0; t<=t1+1e-5; t+=dt){ 
                var v = op.valueAtTime(t, false); 
                op.setValueAtTime(t, v); 
            }
            
            if (thrPct>0){
                var i=2;
                while (i<op.numKeys){
                    var v0 = op.valueAtKey(i-1); 
                    var v1 = op.valueAtKey(i);
                    var dv = Math.abs(v1 - v0);
                    if (dv <= thrPct){ 
                        op.removeKey(i); 
                    } else { 
                        i++; 
                    }
                }
            }
            
            if (hadExpr){ 
                op.expression=""; 
            }
        } finally { 
            app.endUndoGroup(); 
        }
    }

    // --- ウィンドウ表示 ---
    tabPanel.selection = tabMain; // 初期タブを「メイン制御」に設定
    win.center();
    win.show();
})();