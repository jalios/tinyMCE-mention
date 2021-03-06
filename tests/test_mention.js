/*global QUnit, tinymce, jQuery */

(function(tinymce, $, QUnit){
    'use strict';

    var editor;

    function pressDelimiter() {
        editor.fire('keypress', { which: 64 });
        editor.fire('keyup');
    }

    function pressArrowUp() {
        editor.fire('keydown', { which: 38 });
        editor.fire('keyup', { which: 38 });
    }

    function pressArrowDown() {
        editor.fire('keydown', { which: 40 });
        editor.fire('keyup', { which: 40 });
    }

    function pressEscape() {
        editor.fire('keydown', { which: 27 });
        editor.fire('keyup', { which: 27 });
    }

    function pressEnter() {
        editor.fire('keydown', { which: 13 });
        editor.fire('keyup', { which: 13 });
    }

    function removeCharsAtCaret(deletedCharacterCount) {
      var editorRange = editor.selection.getRng(); // get range object for the current caret position

      var node = editorRange.commonAncestorContainer; // relative node to the selection

      var range = document.createRange(); // create a new range object for the deletion
      range.selectNodeContents(node);
      range.setStart(node, deletedCharacterCount <= editorRange.endOffset ? editorRange.endOffset - deletedCharacterCount : editorRange.startOffset); // current caret pos - deletedCharacterCount 
      range.setEnd(node, editorRange.endOffset); // current caret pos
      range.deleteContents();

      editor.focus(); // brings focus back to the editor
    }

    function pressBackspace() {
      removeCharsAtCaret(1);
      editor.fire('keydown', { which: 8 });
      editor.fire('keyup', { which: 8 });
    }

    function insertText(text) {
        var i;
        for (i = 0; i < text.length; i++) {
            editor.insertContent(text[i]);
            editor.fire('keyup', { which: text.charCodeAt(i) });
        }
    }

    QUnit.config.autostart = false;

    QUnit.module('Mention', {
        setup: function () {
            editor = tinymce.get('rte');
        }
    });

    QUnit.testDone(function () {
        pressEscape();
        editor.setContent('');
    });

    QUnit.test('basic test', function (assert) {
        assert.expect(2);

        pressDelimiter();

        assert.ok($('.rte-autocomplete li.loading').length, 'Loading entries...');

        var done = assert.async();

        setTimeout(function () {
            assert.equal($('.rte-autocomplete li').length, 10, 'First 10 entries loaded.');
            done();
        }, 600);
    });

    QUnit.test('keyboard navigation', function (assert) {
        assert.expect(5);

        pressDelimiter();

        var done = assert.async();

        setTimeout(function () {
            pressArrowDown();

            assert.ok($('.rte-autocomplete li:eq(0)').hasClass('active'), 'First entry highlighted.');
            assert.ok(!$('.rte-autocomplete li:eq(1)').hasClass('active'), 'Second entry not highlighted.');

            pressArrowDown();

            assert.ok(!$('.rte-autocomplete li:eq(0)').hasClass('active'), 'First entry not highlighted.');
            assert.ok($('.rte-autocomplete li:eq(1)').hasClass('active'), 'Second entry highlighted.');

            pressArrowUp();
            pressArrowUp();

            assert.ok($('.rte-autocomplete li:last').hasClass('active'), 'Last entry highlighted.');

            done();
        }, 600);
    });

    QUnit.test('search entry', function (assert) {
        assert.expect(2);

        pressDelimiter();
        insertText('st');

        var done = assert.async();

        setTimeout(function () {
            assert.equal($('.rte-autocomplete li').length, 5, '5 entries filtered.');

            insertText('o');
            var done2 = assert.async();

            setTimeout(function () {
                assert.equal($('.rte-autocomplete li').length, 1, '1 entry filtered.');

                done2();
            }, 600);

            done();
        }, 600);
    });

    QUnit.test('pick entry', function (assert) {
        assert.expect(4);

        pressDelimiter();

        var done = assert.async();

        setTimeout(function () {
            assert.equal($('.rte-autocomplete li').length, 10, 'First 10 entries loaded.');

            $('.rte-autocomplete li:eq(1)').click();

            assert.equal(editor.getContent(), '<p>Jenniffer Caffey&nbsp;</p>', 'Entry submitted.');

            insertText('will look into this. ');
            insertText('Can you also have a look ');
            pressDelimiter();
            insertText('eliz');

            var done2 = assert.async();

            setTimeout(function () {
                assert.equal($('.rte-autocomplete li').length, 1, '1 entry loaded.');

                pressArrowDown();
                pressArrowDown();
                pressEnter();

                assert.equal(editor.getContent(), '<p>Jenniffer Caffey&nbsp;will&nbsp;look&nbsp;into&nbsp;this.&nbsp;Can&nbsp;you&nbsp;also&nbsp;have&nbsp;a&nbsp;look&nbsp;Elizabet Gebhart&nbsp;</p>', 'Second entry submitted.');

                done2();
            }, 600);

            done();
        }, 600);
    });

    QUnit.test('cancel out', function (assert) {
        assert.expect(4);

        pressDelimiter();
        insertText('ta');

        var done = assert.async();

        setTimeout(function () {
            assert.equal($('.rte-autocomplete li').length, 3, '3 entries loaded.');

            pressEscape();

            assert.equal(editor.getContent(), '<p>@ta</p>', 'Original text present.');

            insertText(' ');
            pressDelimiter();
            insertText('ba');

            var done2 = assert.async();

            setTimeout(function () {
                assert.equal($('.rte-autocomplete li').length, 2, '2 entries loaded.');

                editor.fire('click');

                assert.equal(editor.getContent(), '<p>@ta @ba</p>', 'Original text present.');

                done2();
            }, 600);

            done();
        }, 600);
    });

    QUnit.test('new query text', function (assert) {
      assert.expect(3);

      pressDelimiter();
      insertText('ta');

      var done = assert.async();

      setTimeout(function () {
          assert.equal($('.rte-autocomplete li').length, 3, 'First query: 3 entries loaded.');

          pressBackspace();
          pressBackspace();

          insertText('ba');

          var done2 = assert.async();

          setTimeout(function () {
              assert.equal($('.rte-autocomplete li').length, 2, 'Second query: 2 entries loaded.');

              pressArrowDown();
              pressEnter();

              assert.equal(editor.getContent(), '<p>Tuyet Ybarbo&nbsp;</p>', 'Second entry submitted.');

              done2();
          }, 600);

          done();
      }, 600);
  });

}(tinymce, jQuery, QUnit));