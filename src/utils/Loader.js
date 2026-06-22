// Loader.js — Centralized asset and data preloader

import { bus } from '../core/EventBus.js';

class Loader {
  constructor() {
    this._cache = {};
    this._progress = 0;
    this._total = 0;
    this._loaded = 0;
  }

  // Load all JSON data files
  async loadAllData() {
    const files = [
      '/src/data/portfolio.json',
      '/src/data/projects.json',
      '/src/data/experience.json',
      '/src/data/skills.json',
      '/src/data/achievements.json'
    ];

    this._total = files.length;
    this._loaded = 0;

    const results = await Promise.all(files.map(f => this._fetchJSON(f)));

    return {
      portfolio:    results[0],
      projects:     results[1],
      experience:   results[2],
      skills:       results[3],
      achievements: results[4]
    };
  }

  async _fetchJSON(url) {
    if (this._cache[url]) {
      this._onItemLoaded();
      return this._cache[url];
    }
    const resp = await fetch(url);
    const data = await resp.json();
    this._cache[url] = data;
    this._onItemLoaded();
    return data;
  }

  _onItemLoaded() {
    this._loaded++;
    this._progress = (this._loaded / this._total) * 100;
    bus.emit('loader:progress', this._progress);
  }

  getProgress() { return this._progress; }
}

export const loader = new Loader();
