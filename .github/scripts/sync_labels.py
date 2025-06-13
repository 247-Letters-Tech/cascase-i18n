import os
import yaml
import requests

LABELS_YML_PATH = os.path.join(os.path.dirname(__file__), '..', 'labels.yml')
GITHUB_API = os.environ.get('GITHUB_API_URL', 'https://api.github.com')
GITHUB_REPOSITORY = os.environ['GITHUB_REPOSITORY']
GITHUB_TOKEN = os.environ['GITHUB_TOKEN']

headers = {
    'Authorization': f'token {GITHUB_TOKEN}',
    'Accept': 'application/vnd.github.v3+json',
}

def main():
    with open(LABELS_YML_PATH, 'r') as f:
        data = yaml.safe_load(f)

    # Resolve color anchors
    colors = data.get('colors', {})
    color_map = {k: v.split()[0] if isinstance(v, str) else v for k, v in colors.items()}

    for label in data['labels']:
        name = label['name']
        color = label['color']
        if isinstance(color, str) and color.startswith('*'):
            color = color_map[color[1:]]
        description = label.get('description', '')
        url = f"{GITHUB_API}/repos/{GITHUB_REPOSITORY}/labels"
        payload = {
            'name': name,
            'color': color,
            'description': description,
        }
        # Try to create, if exists, update
        r = requests.post(url, headers=headers, json=payload)
        if r.status_code == 422 and 'already_exists' in r.text:
            # Update existing label
            update_url = f"{url}/{name}"
            update_response = requests.patch(update_url, headers=headers, json=payload)
            if update_response.status_code == 200:
                print(f"Updated label: {name}")
            else:
                print(f"Failed to update label {name}: {update_response.status_code} {update_response.text}")
        elif r.status_code == 201:
            print(f"Created label: {name}")
        else:
            print(f"Failed to create label {name}: {r.status_code} {r.text}")

if __name__ == '__main__':
    main()