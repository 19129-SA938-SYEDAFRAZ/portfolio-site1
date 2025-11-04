"""
Timeline handler - detects timeline queries and retrieves relevant entries
"""

import json
import re
from pathlib import Path
from typing import List, Dict, Optional


def load_timeline() -> List[Dict]:
    """Load timeline data from JSON file"""
    data_dir = Path(__file__).parent.parent / "data"
    timeline_file = data_dir / "timeline.json"
    
    with open(timeline_file, 'r', encoding='utf-8') as f:
        return json.load(f)


def detect_year_query(query: str) -> Optional[int]:
    """
    Detect if a query is asking about a specific year
    
    Examples:
        - "Tell me about 2021"
        - "What did you do in 2023?"
        - "What happened in 2022"
    
    Returns:
        Year as integer if detected, None otherwise
    """
    # Pattern to match year queries
    patterns = [
        r'\b(20\d{2})\b',  # Matches 2000-2099
        r'in\s+(20\d{2})',
        r'about\s+(20\d{2})',
        r'during\s+(20\d{2})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, query, re.IGNORECASE)
        if match:
            year = int(match.group(1))
            # Only return years that seem reasonable for a career timeline
            if 2000 <= year <= 2030:
                return year
    
    return None


def detect_year_range_query(query: str) -> Optional[tuple]:
    """
    Detect if a query is asking about a year range
    
    Examples:
        - "What did you do between 2020 and 2023?"
        - "Tell me about your work from 2021 to 2023"
    
    Returns:
        Tuple of (start_year, end_year) if detected, None otherwise
    """
    patterns = [
        r'between\s+(20\d{2})\s+and\s+(20\d{2})',
        r'from\s+(20\d{2})\s+to\s+(20\d{2})',
        r'(20\d{2})\s*-\s*(20\d{2})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, query, re.IGNORECASE)
        if match:
            year1 = int(match.group(1))
            year2 = int(match.group(2))
            return (min(year1, year2), max(year1, year2))
    
    return None


def get_timeline_entry(year: int) -> Optional[Dict]:
    """Get timeline entry for a specific year"""
    timeline = load_timeline()
    
    for entry in timeline:
        if entry['year'] == year:
            return entry
    
    return None


def get_timeline_range(start_year: int, end_year: int) -> List[Dict]:
    """Get timeline entries for a year range"""
    timeline = load_timeline()
    
    return [
        entry for entry in timeline
        if start_year <= entry['year'] <= end_year
    ]


def get_all_timeline_entries() -> List[Dict]:
    """Get all timeline entries sorted by year"""
    timeline = load_timeline()
    return sorted(timeline, key=lambda x: x['year'])


def format_timeline_entry(entry: Dict) -> str:
    """Format a timeline entry as readable text"""
    text = f"**{entry['year']}: {entry['title']}**\n\n"
    text += f"{entry['details']}\n\n"
    
    if 'achievements' in entry and entry['achievements']:
        text += "**Achievements:**\n"
        for achievement in entry['achievements']:
            text += f"- {achievement}\n"
        text += "\n"
    
    if 'technologies' in entry and entry['technologies']:
        text += "**Technologies used:** " + ", ".join(entry['technologies']) + "\n"
    
    return text


def format_timeline_entries(entries: List[Dict]) -> str:
    """Format multiple timeline entries as readable text"""
    if not entries:
        return "No timeline entries found for that period."
    
    formatted = []
    for entry in sorted(entries, key=lambda x: x['year']):
        formatted.append(format_timeline_entry(entry))
    
    return "\n---\n\n".join(formatted)


def is_timeline_query(query: str) -> bool:
    """
    Check if a query is asking about timeline/history
    
    Examples:
        - "What's your background?"
        - "Tell me about your journey"
        - "Your experience over the years"
    """
    timeline_keywords = [
        'timeline', 'history', 'journey', 'background',
        'experience over', 'career path', 'progression',
        'how did you start', 'career development'
    ]
    
    query_lower = query.lower()
    return any(keyword in query_lower for keyword in timeline_keywords)


def handle_timeline_query(query: str) -> Optional[str]:
    """
    Handle timeline-related queries and return formatted response
    
    Returns:
        Formatted timeline text if it's a timeline query, None otherwise
    """
    # Check for specific year
    year = detect_year_query(query)
    if year:
        entry = get_timeline_entry(year)
        if entry:
            return format_timeline_entry(entry)
        else:
            return f"I don't have specific information about {year} in my timeline."
    
    # Check for year range
    year_range = detect_year_range_query(query)
    if year_range:
        start_year, end_year = year_range
        entries = get_timeline_range(start_year, end_year)
        return format_timeline_entries(entries)
    
    # Check for general timeline query
    if is_timeline_query(query):
        entries = get_all_timeline_entries()
        return format_timeline_entries(entries)
    
    return None
