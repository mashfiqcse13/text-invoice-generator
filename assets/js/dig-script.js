jQuery(document).ready(function ($) {
    // setting the form 
    $('#invoice-generator').html(`
        <div>
            <h3>Input Method</h3>
            <select id="input-method">
                <option value="form">Form</option>
                <option value="json">JSON File</option>
            </select>
        </div>

        <div id="form-input" class="input-method">
            <h3>Invoice Form</h3>
            <form id="invoice-form">
                <div id="details-container">
                    <div class="item">
                        <label>Customer Name:</label>
                        <input type="text" id="customer-name" required>
                    </div>
                    <div class="item">
                        <label>Phone:</label>
                        <input type="text" id="customer-phone" required>
                    </div>
                    <div class="item">
                        <label>Email:</label>
                        <input type="email" id="customer-email">
                    </div>
                    <div class="item">
                        <label>Invoice Number:</label>
                        <input type="text" id="invoice-number" required>
                    </div>
                    <div class="item">
                        <label>Invoice Date:</label>
                        <input type="date" id="invoice-date" required>
                    </div>
                    <div class="item">

                        <label>Currency:</label>
                        <input type="text" id="currency" placeholder="e.g., USD, EUR, ₹" value="USD" required>
                    </div>
                    <div class="item">
                        <label>Currency Position:</label>
                        <select id="currency-position">
                            <option value="after">After</option>
                            <option value="before">Before</option>
                        </select>
                    </div>
                </div>
                
                <h4>Invoice Items</h4>
                <div id="items-container">
                    <div class="item">
                        <input type="text" placeholder="Description" class="item-description" required>
                        <input type="number" placeholder="Quantity" class="item-quantity" required>
                        <input type="number" placeholder="Unit Price" class="item-unit-price" required>
                    </div>
                </div>
                <button type="button" id="add-item">Add Item</button><br>
                <button type="submit" id="generate-invoice">Generate Invoice</button>
            </form>
        </div>

        <div id="json-input" class="input-method" style="display: none;">
            <h3>Upload JSON File</h3>
            <input type="file" id="json-file" accept=".json">
            <button type="button" id="process-json">Process JSON</button>
        </div>

        <div id="invoice-output" style="display: none;">
            <h3>Generated Invoice</h3>
            <pre id="invoice-text"></pre>
            <button id="export-text">Export as Text</button>
            <button id="export-json">Export as JSON</button>
            <button id="edit-invoice">Edit Invoice</button>
        </div>`);

    // Toggle Input Methods
    $('#input-method').change(function () {
        const selected = $(this).val();
        $('.input-method').hide();
        if (selected === 'form') {
            $('#form-input').show();
        } else {
            $('#json-input').show();
        }
    });

    // Add Item Fields
    $('#add-item').click(function () {
        $('#items-container').append(`
            <div class="item">
                <input type="text" placeholder="Description" class="item-description" required>
                <input type="number" placeholder="Quantity" class="item-quantity" required>
                <input type="number" placeholder="Unit Price" class="item-unit-price" required>
            </div>
        `);
    });

    // Generate Invoice from Form
    $('#invoice-form').submit(function (e) {
        e.preventDefault();

        const invoice = {
            customerName: $('#customer-name').val(),
            phone: $('#customer-phone').val(),
            email: $('#customer-email').val(),
            invoiceNumber: $('#invoice-number').val(),
            invoiceDate: $('#invoice-date').val(),
            currency: $('#currency').val(),
            currencyPosition: $('#currency-position').val(),
            items: [],
            total: 0,
        };

        let total = 0;
        $('#items-container .item').each(function () {
            const description = $(this).find('.item-description').val();
            const quantity = parseFloat($(this).find('.item-quantity').val());
            const unitPrice = parseFloat($(this).find('.item-unit-price').val());
            const itemTotal = quantity * unitPrice;

            invoice.items.push({ description, quantity, unitPrice, itemTotal });
            total += itemTotal;
        });

        invoice.total = total;
        displayInvoice(invoice);
    });

    // Process JSON File
    $('#process-json').click(function () {
        const fileInput = $('#json-file')[0];
        if (fileInput.files.length === 0) {
            alert('Please upload a JSON file.');
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            const invoice = JSON.parse(e.target.result);
            displayInvoice(invoice);
        };
        reader.readAsText(file);
    });

    // Display Invoice
    function displayInvoice(invoice) {
        const formatCurrency = (amount) => {
            return invoice.currencyPosition === 'before'
                ? `${invoice.currency} ${amount.toFixed(2)}`
                : `${amount.toFixed(2)} ${invoice.currency}`;
        };

        const invoiceText = `
Customer Name: ${invoice.customerName}
Phone: ${invoice.phone}
Email: ${invoice.email || 'N/A'}
Invoice Number: ${invoice.invoiceNumber}
Invoice Date: ${invoice.invoiceDate}

Items:
${invoice.items.map(item =>
            `${item.description} | Quantity: ${item.quantity} | Unit Price: ${formatCurrency(item.unitPrice)} | Total: ${formatCurrency(item.itemTotal)}`
        ).join('\n')}

Total: ${formatCurrency(invoice.total)}
        `;

        $('#invoice-text').text(invoiceText);
        $('#invoice-output').show();
        const invoiceFileName = `invoice-${encodeURIComponent(invoice.customerName)}-${invoice.invoiceNumber}-${invoice.invoiceDate}`

        $('#export-text').click(function () {
            const blob = new Blob([invoiceText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = invoiceFileName + '.txt';
            a.click();
        });

        $('#export-json').click(function () {
            const blob = new Blob([JSON.stringify(invoice, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = invoiceFileName + '.json';
            a.click();
        });
        $('#edit-invoice').off('click').click(function () {
            editInvoice(invoice);
        });
    }

    // Edit Invoice Function
    function editInvoice(invoice) {
        $('#input-method').val('form').trigger('change');

        $('#customer-name').val(invoice.customerName);
        $('#customer-phone').val(invoice.phone);
        $('#customer-email').val(invoice.email || '');
        $('#invoice-number').val(invoice.invoiceNumber);
        $('#invoice-date').val(invoice.invoiceDate);
        $('#currency').val(invoice.currency);
        $('#currency-position').val(invoice.currencyPosition);

        // Clear existing items and repopulate
        $('#items-container').empty();
        invoice.items.forEach(item => {
            $('#items-container').append(`
            <div class="item">
                <input type="text" placeholder="Description" class="item-description" value="${item.description}" required>
                <input type="number" placeholder="Quantity" class="item-quantity" value="${item.quantity}" required>
                <input type="number" placeholder="Unit Price" class="item-unit-price" value="${item.unitPrice}" required>
            </div>
        `);
        });

        $('#invoice-output').hide();
    }
});
