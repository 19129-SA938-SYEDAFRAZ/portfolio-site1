"""
Knowledge Graph Builder
Generates graph nodes and edges from portfolio data
"""

import yaml
import json
from pathlib import Path
from typing import List, Dict, Tuple

# Data paths
DATA_DIR = Path(__file__).parent.parent / "data"
SKILLS_FILE = DATA_DIR / "skills.yaml"
TIMELINE_FILE = DATA_DIR / "timeline.json"
PROJECTS_DIR = DATA_DIR / "projects"


def load_skills() -> Dict:
    """Load skills from YAML file"""
    try:
        with open(SKILLS_FILE, 'r') as f:
            return yaml.safe_load(f)
    except Exception as e:
        print(f"Error loading skills: {e}")
        return {}


def load_timeline() -> List[Dict]:
    """Load timeline from JSON file"""
    try:
        with open(TIMELINE_FILE, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading timeline: {e}")
        return []


def load_projects() -> List[Dict]:
    """Load project metadata from markdown files"""
    projects = []
    if not PROJECTS_DIR.exists():
        return projects
    
    for md_file in PROJECTS_DIR.glob("*.md"):
        try:
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
                # Extract title from first line (assuming # Title format)
                lines = content.split('\n')
                title = lines[0].replace('#', '').strip() if lines else md_file.stem
                
                projects.append({
                    'id': md_file.stem,
                    'title': title,
                    'content': content
                })
        except Exception as e:
            print(f"Error loading project {md_file}: {e}")
    
    return projects


def extract_skills_from_text(text: str, all_skills: List[str]) -> List[str]:
    """Extract mentioned skills from text"""
    text_lower = text.lower()
    mentioned = []
    
    for skill in all_skills:
        if skill.lower() in text_lower:
            mentioned.append(skill)
    
    return mentioned


def build_knowledge_graph() -> Tuple[List[Dict], List[Dict]]:
    """
    Build knowledge graph from all data sources
    Returns: (nodes, edges)
    """
    nodes = []
    edges = []
    
    # Load all data
    skills_data = load_skills()
    timeline_data = load_timeline()
    projects_data = load_projects()
    
    # Collect all skill names for relationship detection
    all_skills = []
    
    # Add skill nodes
    if skills_data and 'categories' in skills_data:
        for category in skills_data['categories']:
            category_name = category.get('name', 'Unknown')
            skills_list = category.get('skills', [])
            
            for skill in skills_list:
                skill_id = f"skill_{skill.lower().replace(' ', '_').replace('.', '')}"
                nodes.append({
                    'id': skill_id,
                    'label': skill,
                    'type': 'skill',
                    'category': category_name
                })
                all_skills.append(skill)
    
    # Add timeline/experience nodes
    for idx, entry in enumerate(timeline_data):
        exp_id = f"exp_{idx}_{entry.get('year', 'unknown')}"
        nodes.append({
            'id': exp_id,
            'label': entry.get('title', 'Experience'),
            'type': 'experience',
            'year': entry.get('year'),
            'details': entry.get('details', '')
        })
        
        # Link experiences to mentioned skills
        details = entry.get('details', '')
        mentioned_skills = extract_skills_from_text(details, all_skills)
        for skill in mentioned_skills:
            skill_id = f"skill_{skill.lower().replace(' ', '_').replace('.', '')}"
            edges.append({
                'source': exp_id,
                'target': skill_id,
                'relationship': 'uses'
            })
    
    # Add project nodes
    for project in projects_data:
        proj_id = f"project_{project['id']}"
        nodes.append({
            'id': proj_id,
            'label': project['title'],
            'type': 'project'
        })
        
        # Link projects to mentioned skills
        mentioned_skills = extract_skills_from_text(project['content'], all_skills)
        for skill in mentioned_skills:
            skill_id = f"skill_{skill.lower().replace(' ', '_').replace('.', '')}"
            edges.append({
                'source': proj_id,
                'target': skill_id,
                'relationship': 'uses'
            })
    
    # Create connections between related items
    # Projects and experiences from same year
    for project in projects_data:
        for idx, entry in enumerate(timeline_data):
            # Simple heuristic: if project mentions the experience year
            if str(entry.get('year', '')) in project['content']:
                proj_id = f"project_{project['id']}"
                exp_id = f"exp_{idx}_{entry.get('year', 'unknown')}"
                edges.append({
                    'source': proj_id,
                    'target': exp_id,
                    'relationship': 'related_to'
                })
    
    return nodes, edges
