// require_once 'markdown/Markdown.inc.php';
// use \Michelf\Markdown;

root = typeof exports !== "undefined" && exports !== null ? exports : this;


$dataset    = 'default';
$dataset_qs = '';
if (isset($_GET['dataset'])) {
  if (!preg_match('@[^a-z0-9-_ ]@i', $_GET['dataset'])) {
    if (is_dir('data/' . $_GET['dataset'])) {
      $dataset    = $_GET['dataset'];
      $dataset_qs = "?dataset=$dataset";
    }
  }
}

function get_html_docs($obj) {
  global $config, $data, $dataset, $errors;

  $name = str_replace('/', '_', $obj['name']);
  error_log("\n21 $ name, $obj [ name ] = '$name'", 3, "my-errors.log");
  $filename = "data/$dataset/$name.mkdn";
  error_log("\n23 $ filename = '$filename'", 3, "my-errors.log");
  $name = str_replace('_', '\_', $obj['name']);
  error_log("\n25 $ name = '$name'", 3, "my-errors.log");
  $type = $obj['type'];
  error_log("\n27 $ obj [ type ] = '$type'", 3, "my-errors.log");
  // error_log("\n28 (  config[ ' types '][ $ type])  = '($config['types'][$type])'", 3, "my-errors.log");
  if ($config['types'][$type]) {
    error_log("\n30 true", 3, "my-errors.log");
    $type = $config['types'][$type]['long'];
  }

  $markdown = "## $name *$type*\n\n";
  error_log("\n35 $ markdown = '$markdown'", 3, "my-errors.log");
  if (file_exists($filename)) {
    $markdown .= "### Documentation\n\n";
    $markdown .= file_get_contents($filename);
    error_log("\n40 file exists, $ markdown = '$markdown'", 3, "my-errors.log");
  } else {
    $markdown .= "<div class=\"alert alert-warning\">35 No documentation for this object</div>";
    error_log("\n42 file DOES NOT exist, $ markdown = '$markdown'", 3, "my-errors.log");
  }

  if ($obj) {
    error_log("\n46 file exists, $ obj = '$obj'", 3, "my-errors.log");
    $markdown .= "\n\n";
    $markdown .= get_depends_markdown('Depends on',     $obj['depends']);
    $markdown .= get_depends_markdown('Depended on by', $obj['dependedOnBy']);
    error_log("\n49 file exists, $ markdown = '$markdown'", 3, "my-errors.log");

  }

  // Use {{object_id}} to link to an object
  $arr      = explode('{{', $markdown);
  $markdown = $arr[0];
  for ($i = 1; $i < count($arr); $i++) {
    $pieces    = explode('}}', $arr[$i], 2);
    $name      = $pieces[0];
    $id_string = get_id_string($name);
    $name_esc  = str_replace('_', '\_', $name);
    $class     = 'select-object';
    if (!isset($data[$name])) {
      $class .= ' missing';
      $errors[] = "55 Object '$obj[name]' links to unrecognized object '$name'";             error_log("\n57 Object '$obj[name]' links to unrecognized object '$name'", 3, "my-errors.log");
    }
    $markdown .= "<a href=\"#$id_string\" class=\"$class\" data-name=\"$name\">$name_esc</a>";
    $markdown .= $pieces[1];

    error_log("\n69 $ markdown = '$markdown'", 3, "my-errors.log");

  }

  $html = Markdown::defaultTransform($markdown);
  // IE can't handle <pre><code> (it eats all the line breaks)
  $html = str_replace('<pre><code>'  , '<pre>' , $html);
  $html = str_replace('</code></pre>', '</pre>', $html);

  error_log("\n79 $ html = '$html'", 3, "my-errors.log");
  return $html;


}


function get_depends_markdown($header, $arr) {

  // echo 'debug_view($header) = ';
  // debug_view($header);
  //      echo 'debug_view($arr) = ';
  // debug_view($arr);


  $markdown = "### $header";






  if (!empty($arr) && (is_array($arr)) && count($arr)) {
    $markdown .= "\n\n";
    foreach ($arr as $name) {
      $markdown .= "* {{" . $name . "}}\n";
    }
    $markdown .= "\n";
  } else {
    $markdown .= " *(none)*\n\n";
  }
  return $markdown;
}

function get_id_string($name) {
  return 'obj-' . preg_replace('@[^a-z0-9]+@i', '-', $name);
}

function read_config() {
  global $config, $dataset, $dataset_qs;

  $config = json_decode(file_get_contents("data/$dataset/config.json" ), true);
  $config['jsonUrl'] = "json.php$dataset_qs";
}

function read_data() {
  global $config, $data, $dataset, $errors;

  if (!$config) read_config();

  $json   = json_decode(file_get_contents("data/$dataset/objects.json"), true);
  $data   = array();
  $errors = array();

  foreach ($json as $obj) {
    $data[$obj['name']] = $obj;
  }

  foreach ($data as &$obj) {
    $obj['dependedOnBy'] = array();
  }
  unset($obj);
  foreach ($data as &$obj) {
    // echo '117 debug_view($data)';
    // echo dbug('print');
    // debug_view($data);
    // debug_view("116 $data = " + $data);
    // echo '121 debug_view($obj)';
    // debug_view($obj);

    if (!empty($obj['depends']) && ( is_array( $obj['depends']))) {

      foreach ($obj['depends'] as $name) {
        if ($data[$name]) {
          $data[$name]['dependedOnBy'][] = $obj['name'];
        } else {
          $errors[] = "137 Unrecognized dependency: '$obj[name]' depends on '$name'";
          error_log("\n141 Unrecognized dependency: '$obj[name]' depends on '$name'", 3, "my-errors.log");

        }
      }
    } else {
      $errors[] = "148 Unrecognized dependency: '$obj[name]' depends on '$name'";
      error_log("\n149 Unrecognized dependency: '$obj[name]' depends on '$name'", 3, "my-errors.log");
    }
  }
  unset($obj);
  foreach ($data as &$obj) {
    $xx = get_html_docs($obj);

    $obj['docs'] = $xx;
    //get_html_docs($obj);
// $xx = $obj['docs'];

    error_log("\n167 obj [ docs ] = get_html _docs ( obj ) = '$xx'", 3, "my-errors.log");

  }
  unset($obj);
}


function debug_view ( $what ) {
  echo '<pre>';
  if ( is_array( $what ) )  {
    print_r ( $what );
  } else {
    var_dump ( $what );
  }
  echo '</pre>';
}


/**
 * dbug (mixed $expression [, mixed $expression [, $... ]])
 * Author : dcz
 * Feel free to use as you wish at your own risk ;-)
 */

function dbug() {
  static $output = '', $doc_root;
  $args = func_get_args();
  if (!empty($args) && $args[0] === 'print') {
    $_output = $output;
    $output = '';
    return $_output;
  }
  // do not repeat the obvious (matter of taste)
  if (!isset($doc_root)) {
    $doc_root = str_replace('\\', '/', $_SERVER['DOCUMENT_ROOT']);
  }
  $backtrace = debug_backtrace();
  // you may want not to htmlspecialchars here
  $line = htmlspecialchars($backtrace[0]['line']);
  $file = htmlspecialchars(str_replace(array('\\', $doc_root), array('/', ''), $backtrace[0]['file']));
  $class = !empty($backtrace[1]['class']) ? htmlspecialchars($backtrace[1]['class']) . '::' : '';
  $function = !empty($backtrace[1]['function']) ? htmlspecialchars($backtrace[1]['function']) . '() ' : '';
  $output .= "<b>$class$function =&gt;$file #$line</b><pre>";
  ob_start();
  foreach ($args as $arg) {
    var_dump($arg);
  }
  $output .= htmlspecialchars(ob_get_contents(), ENT_COMPAT, 'UTF-8');
  ob_end_clean();
  $output .= '</pre>';
}

?>
