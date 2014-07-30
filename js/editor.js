/* global marked, hljs, CodeMirror, saveAs */

marked.setOptions({
	langPrefix: 'hljs ',
	highlight: function(code) {
		return hljs.highlightAuto(code).value;
	}
});

$(function() {
	var storageKey = 'markdoc',
		storageNameKey = 'markdocName',
		lastValue,
		mode = 'gfm',
		editor = $('#editor'),
		storageValue = localStorage.getItem(storageKey) || $.trim($('#readme').html());
	if (storageValue) {
		editor.val(storageValue);
	}
	var mirror = CodeMirror.fromTextArea(editor[0], {
			mode: mode,
			cursorHeight: 1,
			// lineNumbers: true,
			// lineWrapping: true,
			styleActiveLine: true
		});
	mirror.focus();
	var $iframe = $('iframe'),
		iframeWin = $iframe[0].contentWindow,
		$iframeWin = $(iframeWin),
		$iframeDoc = $(iframeWin.document),
		preview,
		handler,
		editorScrolling,
		previewScrolling,
		timeout = 500;
	mirror.on('change', function(mirror) {
		clearTimeout(handler);
		handler = setTimeout(render, timeout);
	});
	mirror.on('scroll', function(mirror) {
		if (previewScrolling) {
			previewScrolling = false;
			return;
		}
		editorScrolling = true;
		getPreview();
		var info = mirror.getScrollInfo();
		var top = (preview.outerHeight() - info.clientHeight) *
			info.top / (info.height - info.clientHeight);
		iframeWin.scrollTo(0, top);
	});
	$iframeWin.on('scroll', function() {
		if (editorScrolling) {
			editorScrolling = false;
			return;
		}
		previewScrolling = true;
		getPreview();
		var info = mirror.getScrollInfo();
		var top = (info.height - info.clientHeight) *
			$iframeWin.scrollTop() / (preview.outerHeight() - info.clientHeight);
		mirror.scrollTo(0, top);
	});

	function getPreview() {
		if (!(preview && preview.length > 0)) {
			preview = $(iframeWin.document).find('#container');
		}
	}

	function render(e) {
		// console.log(e);
		var value = mirror.getDoc().getValue();
		if (value === lastValue) {
			return;
		}
		lastValue = value;
		iframeWin.render(marked(value));
		localStorage.setItem(storageKey, value);
	}

	if (window._previewLoaded) {
		render('preview load before');
	} else {
		window.previewLoaded = function(){
			render('preview load');
		};
	}

	var inputName = $('#input-name');
	var storageName = localStorage.getItem(storageNameKey);
	if (storageName) {
		inputName.val(storageName);
	}
	inputName.change(function(){
		localStorage.setItem(storageNameKey, inputName.val());
	});

	function getName(ext) {
		return (inputName.val() || 'mark') + ext;
	}

	$('#btn-md').click(function(){
		var content = mirror.getDoc().getValue();
		var blob = new Blob([content], {type: 'text/x-markdown;charset=utf-8'});
		saveAs(blob, getName('.md'));
	});

	function download(ext, type) {
		var doc = iframeWin.document,
			head = doc.head,
			links = $(head).find('link'),
			ajaxes = [],
			text = [];
		links.each(function(i){
			ajaxes.push($.ajax({
				url: this.href
			}));
		});
		$.when.apply($, ajaxes).done(function(){
			for (var i = 0; i < arguments.length; i += 1) {
				text.push(arguments[i][0]);
			}
			var content = iframeWin.document.body.parentNode.outerHTML;
			if (content.charAt(1) !== '!') {
				content = '<!doctype html>' + content;
			}
			// Replace external styles with inline <style>
			content = content.replace(/(<link[^>]*>\s*(<\/link>)?\s*)+/, '<style type="text/css">' + text.join('\n') + '</style>');
			// Remove scripts
			content = content.replace(/<script[^>]*>[\s\S]*?<\/script>\s*/g, '');
			var blob = new Blob([content], {type: type});
			saveAs(blob, getName(ext));
		});
	}

	$('#btn-doc').click(function(){
		download('.doc', 'application/msword');
	});

	$('#btn-html').click(function(){
		download('.html', 'text/html;charset=utf-8');
	});

	var isFileSaverSupported;
	try {
		isFileSaverSupported = !!new Blob();
	} catch (e) {}
	if (! Array.prototype.forEach) {
		$('.tools').append(' 注意：你的浏览器不支持预览和下载，请使用 chrome 等现代浏览器。');
	} else if (! isFileSaverSupported) {
		$('.tools').append(' 注意：你的浏览器不支持下载，请使用 chrome 等现代浏览器。');
	}
});
