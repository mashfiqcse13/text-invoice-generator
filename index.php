<?php
/*
Plugin Name: Dynamic Invoice Generator
Description: A plugin to dynamically generate invoices using a form or JSON input, with export options in text and JSON formats. Use the <div id="invoice-generator"></div> html code in any post or page.
Version: 1.0
Author: MD. Mashfiqur Rahman
*/

function dig_enqueue_scripts()
{
    $ver = "1.0.1";// version number of the plugin
    wp_enqueue_script('jquery');
    wp_enqueue_script('dig-script', plugin_dir_url(__FILE__) . 'assets/js/dig-script.js', array('jquery'), $ver, true);
    wp_enqueue_style('dig-style', plugin_dir_url(__FILE__) . 'assets/css/dig-style.css', [], $ver);
}
add_action('wp_enqueue_scripts', 'dig_enqueue_scripts');
