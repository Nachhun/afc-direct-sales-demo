(function () {
    function setupPrintButtons() {
        var printBtn = document.getElementById('printBtn');
        if (printBtn && !printBtn.dataset.bound) {
            printBtn.dataset.bound = 'true';
            printBtn.addEventListener('click', function (e) {
                e.preventDefault();
                window.print();
            });
        }

        var printAllBtn = document.getElementById('printAllBtn');
        if (printAllBtn && !printAllBtn.dataset.bound) {
            printAllBtn.dataset.bound = 'true';
            printAllBtn.addEventListener('click', function (e) {
                e.preventDefault();
                window.print();
            });
        }

        var buttons = document.querySelectorAll('.btn-print, .btn-print-all');
        for (var i = 0; i < buttons.length; i++) {
            var b = buttons[i];
            if (!b.dataset.bound) {
                b.dataset.bound = 'true';
                b.addEventListener('click', function (e) {
                    e.preventDefault();
                    window.print();
                });
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupPrintButtons);
    } else {
        setupPrintButtons();
    }

    setTimeout(setupPrintButtons, 150);
    setTimeout(setupPrintButtons, 500);
})();
