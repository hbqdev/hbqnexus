from flask import Flask, render_template
import json
import os

app = Flask(__name__)

def load_services():
    services = []
    services_dir = os.path.join(app.root_path, 'data', 'services')
    
    # Load configuration
    config_path = os.path.join(app.root_path, 'data', 'config.json')
    with open(config_path, 'r') as f:
        config = json.load(f)
    
    # Load services based on config categories
    for category in config['categories']:
        file_path = os.path.join(services_dir, f'{category}.json')
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                data = json.load(f)
                for service in data['services']:
                    service['category'] = data['category']
                    services.append(service)
    
    return services, config

@app.route('/')
def index():
    services, config = load_services()
    return render_template('index.html', services=services, config=config)

if __name__ == '__main__':
    app.run(debug=True)
