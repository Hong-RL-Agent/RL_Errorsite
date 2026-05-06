import React from 'react';
import ProjectCard from './ProjectCard';

export default function ProjectSection({ projects }) {
  return (
    <section id="projects" className="project-section">
      <div className="container">
        <h2 style={{ fontSize: '48px', fontFamily: 'Playfair Display', marginBottom: '60px', textAlign: 'center' }}>Featured Projects</h2>
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
