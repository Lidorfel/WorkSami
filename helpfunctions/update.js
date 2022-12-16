function checkNull(object1) {
  return (
    object1.new_password &&
    object1.phone_number &&
    object1.email &&
    object1.study_year &&
    object1.grades
  );
}
export { checkNull };
