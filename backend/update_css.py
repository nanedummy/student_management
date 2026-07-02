import re

with open('../frontend/src/index.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all occurrences of input[type="date"] with input[type="date"], input[type="datetime-local"]
# First, let's just do a naive replace:
new_content = content.replace('input[type="date"]', 'input[type="date"], input[type="datetime-local"]')

# Now we need to duplicate the -month-field, -day-field, -year-field pseudo-selectors
# to include -hour-field, -minute-field, -ampm-field for datetime-local.
# To do this safely, we will look for:
# input[type="datetime-local"]::-webkit-datetime-edit-year-field
# and append the hour/minute/ampm versions.

def add_time_fields(match):
    prefix = match.group(0)
    # suffix is something like:
    # , input[type="datetime-local"]::-webkit-datetime-edit-hour-field
    suffix = prefix.replace("-year-field", "-hour-field") + ", " + \
             prefix.replace("-year-field", "-minute-field") + ", " + \
             prefix.replace("-year-field", "-ampm-field")
    return prefix + ",\n" + suffix

new_content = re.sub(r'input\[type="datetime-local"\]::-webkit-datetime-edit-year-field(?:[a-z:-]*)', add_time_fields, new_content)

with open('../frontend/src/index.css', 'w', encoding='utf-8') as f:
    f.write(new_content)
print("Updated CSS successfully.")
