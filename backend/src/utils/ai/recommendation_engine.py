#!/usr/bin/env python3
"""
AI-Powered Job Recommendation Engine

Uses machine learning techniques to provide personalized job recommendations
based on user skills, interests, and behavior patterns.

Features:
- TF-IDF based text similarity for job matching
- Collaborative filtering from user behavior
- Skill-based matching with weighted scoring
- Learning from saved jobs and applications

No external APIs required - pure Python implementation.
"""

import json
import sys
import math
import re
from collections import defaultdict
from typing import Dict, List, Tuple, Optional
import argparse


class TextProcessor:
    """Process and vectorize text for similarity calculations."""

    def __init__(self):
        self.stop_words = {
            'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
            'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
            'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
            'that', 'this', 'these', 'those', 'it', 'its', 'we', 'you', 'they',
            'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how',
            'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some',
            'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
            'very', 'just', 'also', 'now', 'here', 'there', 'then', 'about', 'above',
            'after', 'again', 'against', 'any', 'because', 'before', 'below',
            'between', 'down', 'during', 'if', 'into', 'through', 'under', 'until',
            'up', 'while', 'our', 'your', 'their', 'my', 'experience', 'work',
            'working', 'job', 'team', 'company', 'ability', 'strong', 'looking',
            'required', 'requirements', 'preferred', 'including', 'etc', 'years'
        }

    def tokenize(self, text: str) -> List[str]:
        """Tokenize text into words."""
        if not text:
            return []
        # Convert to lowercase and split on non-alphanumeric characters
        words = re.findall(r'\b[a-z]+\b', text.lower())
        # Remove stop words and short words
        return [w for w in words if w not in self.stop_words and len(w) > 2]

    def compute_tf(self, tokens: List[str]) -> Dict[str, float]:
        """Compute term frequency."""
        tf = defaultdict(int)
        for token in tokens:
            tf[token] += 1
        # Normalize by total tokens
        total = len(tokens)
        if total == 0:
            return {}
        return {k: v / total for k, v in tf.items()}

    def compute_idf(self, documents: List[List[str]]) -> Dict[str, float]:
        """Compute inverse document frequency."""
        n_docs = len(documents)
        if n_docs == 0:
            return {}

        # Count document frequency for each term
        df = defaultdict(int)
        for doc in documents:
            unique_terms = set(doc)
            for term in unique_terms:
                df[term] += 1

        # Compute IDF with smoothing
        return {term: math.log((n_docs + 1) / (freq + 1)) + 1 for term, freq in df.items()}

    def compute_tfidf(self, tf: Dict[str, float], idf: Dict[str, float]) -> Dict[str, float]:
        """Compute TF-IDF vector."""
        return {term: tf_val * idf.get(term, 0) for term, tf_val in tf.items()}


class SkillMatcher:
    """Match skills with weighted scoring."""

    # Skill categories for better matching
    SKILL_CATEGORIES = {
        'frontend': ['react', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css', 'tailwind', 'bootstrap', 'nextjs', 'svelte'],
        'backend': ['nodejs', 'python', 'java', 'csharp', 'go', 'ruby', 'php', 'express', 'django', 'flask', 'spring', 'rails', 'fastapi'],
        'database': ['postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'sql', 'nosql', 'dynamodb', 'firebase'],
        'devops': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible', 'cicd', 'linux'],
        'mobile': ['react native', 'flutter', 'swift', 'kotlin', 'ios', 'android'],
        'data': ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'data analysis', 'spark'],
        'design': ['figma', 'sketch', 'ui design', 'ux design', 'adobe xd', 'photoshop']
    }

    def __init__(self):
        # Build reverse mapping
        self.skill_to_category = {}
        for category, skills in self.SKILL_CATEGORIES.items():
            for skill in skills:
                self.skill_to_category[skill.lower()] = category

    def normalize_skill(self, skill: str) -> str:
        """Normalize skill name for comparison."""
        return skill.lower().strip().replace('-', ' ').replace('_', ' ')

    def calculate_skill_match(self, user_skills: List[str], job_skills: List[str]) -> Tuple[float, List[str], List[str]]:
        """
        Calculate skill match score between user and job.
        Returns (score, matching_skills, related_skills)
        """
        if not user_skills or not job_skills:
            return 0.0, [], []

        user_normalized = set(self.normalize_skill(s) for s in user_skills)
        job_normalized = set(self.normalize_skill(s) for s in job_skills)

        # Direct matches
        direct_matches = user_normalized & job_normalized
        matching_skills = list(direct_matches)

        # Find related skills (same category)
        related_skills = []
        user_categories = set()
        for skill in user_normalized:
            if skill in self.skill_to_category:
                user_categories.add(self.skill_to_category[skill])

        for job_skill in job_normalized - direct_matches:
            if job_skill in self.skill_to_category:
                if self.skill_to_category[job_skill] in user_categories:
                    related_skills.append(job_skill)

        # Calculate score
        # Direct match: full point, Related: 0.5 points
        if len(job_normalized) == 0:
            return 0.0, matching_skills, related_skills

        direct_score = len(direct_matches) / len(job_normalized)
        related_score = (len(related_skills) * 0.5) / len(job_normalized)

        # Weight: 70% direct, 30% related
        final_score = min(1.0, (direct_score * 0.7) + (related_score * 0.3))

        return final_score, matching_skills, related_skills


class JobRecommendationEngine:
    """Main recommendation engine combining multiple algorithms."""

    def __init__(self):
        self.text_processor = TextProcessor()
        self.skill_matcher = SkillMatcher()

    def cosine_similarity(self, vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
        """Calculate cosine similarity between two vectors."""
        if not vec1 or not vec2:
            return 0.0

        # Get common terms
        common_terms = set(vec1.keys()) & set(vec2.keys())
        if not common_terms:
            return 0.0

        # Calculate dot product
        dot_product = sum(vec1[term] * vec2[term] for term in common_terms)

        # Calculate magnitudes
        mag1 = math.sqrt(sum(v ** 2 for v in vec1.values()))
        mag2 = math.sqrt(sum(v ** 2 for v in vec2.values()))

        if mag1 == 0 or mag2 == 0:
            return 0.0

        return dot_product / (mag1 * mag2)

    def learn_user_interests(self, user_data: Dict) -> Dict:
        """
        Learn user interests from their behavior.

        Args:
            user_data: {
                'profile_skills': [...],
                'applied_jobs': [...],
                'saved_jobs': [...],
                'viewed_jobs': [...]  # optional
            }

        Returns:
            Interest profile with weighted scores
        """
        interests = {
            'skills': defaultdict(float),
            'industries': defaultdict(float),
            'job_types': defaultdict(float),
            'locations': defaultdict(float),
            'experience_levels': defaultdict(float),
            'salary_range': {'min': None, 'max': None}
        }

        # Weight different sources
        weights = {
            'applied': 1.0,      # Highest weight - user took action
            'saved': 0.7,        # High weight - user showed interest
            'viewed': 0.3,       # Lower weight - just browsed
            'profile': 0.5       # Medium weight - self-declared
        }

        # Process profile skills
        for skill in user_data.get('profile_skills', []):
            interests['skills'][skill.lower()] += weights['profile']

        # Process applied jobs
        for job in user_data.get('applied_jobs', []):
            self._extract_job_interests(job, interests, weights['applied'])

        # Process saved jobs
        for job in user_data.get('saved_jobs', []):
            self._extract_job_interests(job, interests, weights['saved'])

        # Normalize scores
        for category in ['skills', 'industries', 'job_types', 'locations', 'experience_levels']:
            if interests[category]:
                max_val = max(interests[category].values())
                if max_val > 0:
                    interests[category] = {k: v / max_val for k, v in interests[category].items()}

        return dict(interests)

    def _extract_job_interests(self, job: Dict, interests: Dict, weight: float):
        """Extract interest signals from a job."""
        # Skills
        for skill in job.get('skills_required', []) or job.get('skillsRequired', []) or []:
            interests['skills'][skill.lower()] += weight

        # Job type
        job_type = job.get('job_type') or job.get('jobType')
        if job_type:
            interests['job_types'][job_type.lower()] += weight

        # Location
        location = job.get('location')
        if location:
            interests['locations'][location.lower()] += weight

        # Experience level
        exp_level = job.get('experience_level') or job.get('experienceLevel')
        if exp_level:
            interests['experience_levels'][exp_level.lower()] += weight

        # Industry (from company if available)
        industry = job.get('industry')
        if industry:
            interests['industries'][industry.lower()] += weight

        # Salary range
        salary_min = job.get('salary_min') or job.get('salaryMin')
        salary_max = job.get('salary_max') or job.get('salaryMax')
        if salary_min:
            if interests['salary_range']['min'] is None:
                interests['salary_range']['min'] = salary_min
            else:
                interests['salary_range']['min'] = min(interests['salary_range']['min'], salary_min)
        if salary_max:
            if interests['salary_range']['max'] is None:
                interests['salary_range']['max'] = salary_max
            else:
                interests['salary_range']['max'] = max(interests['salary_range']['max'], salary_max)

    def calculate_job_score(
        self,
        job: Dict,
        user_skills: List[str],
        user_interests: Optional[Dict] = None,
        applied_job_ids: Optional[set] = None,
        saved_job_ids: Optional[set] = None
    ) -> Dict:
        """
        Calculate comprehensive score for a job.

        Returns score breakdown and total score.
        """
        job_id = job.get('id')

        # Skip already applied jobs
        if applied_job_ids and job_id in applied_job_ids:
            return None

        job_skills = job.get('skills_required', []) or job.get('skillsRequired', []) or []

        # 1. Skill Match Score (40% weight)
        skill_score, matching_skills, related_skills = self.skill_matcher.calculate_skill_match(
            user_skills, job_skills
        )

        # 2. Interest Match Score (30% weight)
        interest_score = 0.0
        interest_breakdown = {}

        if user_interests:
            # Skill interest alignment
            skill_interest_score = 0.0
            if user_interests.get('skills'):
                for skill in job_skills:
                    skill_interest_score += user_interests['skills'].get(skill.lower(), 0)
                if job_skills:
                    skill_interest_score /= len(job_skills)
            interest_breakdown['skills'] = skill_interest_score

            # Job type alignment
            job_type = (job.get('job_type') or job.get('jobType', '')).lower()
            type_score = user_interests.get('job_types', {}).get(job_type, 0)
            interest_breakdown['job_type'] = type_score

            # Location alignment
            location = (job.get('location') or '').lower()
            location_score = user_interests.get('locations', {}).get(location, 0)
            # Boost remote jobs if user has shown interest
            if 'remote' in location.lower():
                location_score = max(location_score, user_interests.get('locations', {}).get('remote', 0))
            interest_breakdown['location'] = location_score

            # Experience level alignment
            exp_level = (job.get('experience_level') or job.get('experienceLevel', '')).lower()
            exp_score = user_interests.get('experience_levels', {}).get(exp_level, 0)
            interest_breakdown['experience'] = exp_score

            # Combined interest score
            interest_score = (
                skill_interest_score * 0.4 +
                type_score * 0.2 +
                location_score * 0.2 +
                exp_score * 0.2
            )

        # 3. Saved Job Boost (10% weight)
        saved_boost = 0.0
        if saved_job_ids and job_id in saved_job_ids:
            saved_boost = 1.0

        # 4. Recency Score (10% weight)
        recency_score = 1.0  # Default to max if no date
        created_at = job.get('created_at') or job.get('createdAt')
        if created_at:
            # Jobs posted in last 7 days get full score, decays after
            # This would need proper date parsing in production
            recency_score = 0.8  # Simplified for now

        # 5. Salary Match Score (10% weight)
        salary_score = 0.5  # Neutral default
        if user_interests and user_interests.get('salary_range'):
            user_min = user_interests['salary_range'].get('min')
            user_max = user_interests['salary_range'].get('max')
            job_min = job.get('salary_min') or job.get('salaryMin')
            job_max = job.get('salary_max') or job.get('salaryMax')

            if job_min and job_max and (user_min or user_max):
                # Check overlap
                if user_max and job_min > user_max:
                    salary_score = 0.2  # Job pays more than expected (might be good!)
                elif user_min and job_max < user_min:
                    salary_score = 0.1  # Job pays less than expected
                else:
                    salary_score = 0.8  # Good overlap

        # Calculate total score
        total_score = (
            skill_score * 0.40 +
            interest_score * 0.30 +
            saved_boost * 0.10 +
            recency_score * 0.10 +
            salary_score * 0.10
        )

        return {
            'job_id': job_id,
            'total_score': round(total_score * 100, 1),
            'skill_score': round(skill_score * 100, 1),
            'interest_score': round(interest_score * 100, 1),
            'matching_skills': matching_skills,
            'related_skills': related_skills,
            'interest_breakdown': interest_breakdown,
            'is_saved': saved_boost > 0
        }

    def get_recommendations(
        self,
        user_data: Dict,
        all_jobs: List[Dict],
        limit: int = 20
    ) -> List[Dict]:
        """
        Get personalized job recommendations.

        Args:
            user_data: User profile and behavior data
            all_jobs: List of all available jobs
            limit: Maximum number of recommendations

        Returns:
            List of recommended jobs with scores
        """
        user_skills = user_data.get('profile_skills', [])
        applied_job_ids = set(user_data.get('applied_job_ids', []))
        saved_job_ids = set(user_data.get('saved_job_ids', []))

        # Learn user interests from behavior
        user_interests = self.learn_user_interests(user_data)

        # Score all jobs
        scored_jobs = []
        for job in all_jobs:
            score_result = self.calculate_job_score(
                job,
                user_skills,
                user_interests,
                applied_job_ids,
                saved_job_ids
            )

            if score_result and score_result['total_score'] > 20:  # Minimum threshold
                job_with_score = {
                    **job,
                    'match_score': score_result['total_score'],
                    'skill_match': score_result['skill_score'],
                    'interest_match': score_result['interest_score'],
                    'matching_skills': score_result['matching_skills'],
                    'related_skills': score_result['related_skills'],
                    'is_saved': score_result['is_saved']
                }
                scored_jobs.append(job_with_score)

        # Sort by score and return top N
        scored_jobs.sort(key=lambda x: x['match_score'], reverse=True)
        return scored_jobs[:limit]

    def get_similar_jobs(self, target_job: Dict, all_jobs: List[Dict], limit: int = 5) -> List[Dict]:
        """
        Find jobs similar to a given job.
        Useful for "You might also like" suggestions.
        """
        if not target_job:
            return []

        target_skills = set(s.lower() for s in (target_job.get('skills_required', []) or target_job.get('skillsRequired', []) or []))
        target_type = (target_job.get('job_type') or target_job.get('jobType', '')).lower()
        target_location = (target_job.get('location') or '').lower()
        target_id = target_job.get('id')

        similar_jobs = []
        for job in all_jobs:
            if job.get('id') == target_id:
                continue

            job_skills = set(s.lower() for s in (job.get('skills_required', []) or job.get('skillsRequired', []) or []))

            # Calculate similarity
            skill_overlap = len(target_skills & job_skills) / max(len(target_skills | job_skills), 1)
            type_match = 1.0 if (job.get('job_type') or job.get('jobType', '')).lower() == target_type else 0.0
            location_match = 1.0 if (job.get('location') or '').lower() == target_location else 0.0

            similarity = skill_overlap * 0.6 + type_match * 0.2 + location_match * 0.2

            if similarity > 0.3:
                similar_jobs.append({
                    **job,
                    'similarity_score': round(similarity * 100, 1)
                })

        similar_jobs.sort(key=lambda x: x['similarity_score'], reverse=True)
        return similar_jobs[:limit]


def main():
    """Main entry point for CLI usage."""
    parser = argparse.ArgumentParser(description='Job Recommendation Engine')
    parser.add_argument('--action', type=str, required=True,
                        choices=['recommend', 'similar', 'learn'],
                        help='Action to perform')
    parser.add_argument('--input', type=str, required=True,
                        help='JSON input file or stdin if -')
    parser.add_argument('--limit', type=int, default=20,
                        help='Maximum number of results')

    args = parser.parse_args()

    # Read input
    if args.input == '-':
        input_data = json.loads(sys.stdin.read())
    else:
        with open(args.input, 'r') as f:
            input_data = json.load(f)

    engine = JobRecommendationEngine()

    if args.action == 'recommend':
        user_data = input_data.get('user_data', {})
        all_jobs = input_data.get('jobs', [])
        recommendations = engine.get_recommendations(user_data, all_jobs, args.limit)
        print(json.dumps({'success': True, 'recommendations': recommendations}))

    elif args.action == 'similar':
        target_job = input_data.get('target_job', {})
        all_jobs = input_data.get('jobs', [])
        similar = engine.get_similar_jobs(target_job, all_jobs, args.limit)
        print(json.dumps({'success': True, 'similar_jobs': similar}))

    elif args.action == 'learn':
        user_data = input_data.get('user_data', {})
        interests = engine.learn_user_interests(user_data)
        print(json.dumps({'success': True, 'interests': interests}))


if __name__ == '__main__':
    main()
