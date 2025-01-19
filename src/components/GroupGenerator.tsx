import { useState, type ChangeEventHandler } from 'react';
import { Member, Group } from '../types/types';
import { v4 as uuidv4 } from 'uuid';
import Papa from 'papaparse';

const GroupGenerator = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [newMember, setNewMember] = useState('');
  const [groupSize, setGroupSize] = useState(2);
  const [numberOfGroups, setNumberOfGroups] = useState(2);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupingMethod, setGroupingMethod] = useState<'size' | 'count'>('size');
  const [isPlayerListVisible, setIsPlayerListVisible] = useState(true);

  const handleAddMember = () => {
    if (newMember.trim()) {
      setMembers([...members, { id: uuidv4(), name: newMember.trim() }]);
      setNewMember('');
    }
  };

  const handleFileUpload: ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          const newMembers: Member[] = results.data
            .flat()
            .filter((name): name is string => typeof name === 'string' && name.trim() !== '')
            .map((name) => ({
              id: uuidv4(),
              name: name.trim(),
            }));
          setMembers([...members, ...newMembers]);
        },
      });
    }
  };

  const generateGroups = () => {
    if (members.length === 0) return;
    const shuffledMembers = [...members].sort(() => Math.random() - 0.5);
    const newGroups: Group[] = [];
    
    if (groupingMethod === 'size') {
      // Generate groups based on size per group
      for (let i = 0; i < shuffledMembers.length; i += groupSize) {
        newGroups.push({
          id: uuidv4(),
          members: shuffledMembers.slice(i, i + groupSize),
        });
      }
    } else {
      // Generate specific number of groups
      const membersPerGroup = Math.ceil(shuffledMembers.length / numberOfGroups);
      for (let i = 0; i < numberOfGroups; i++) {
        const startIdx = i * membersPerGroup;
        const groupMembers = shuffledMembers.slice(startIdx, startIdx + membersPerGroup);
        if (groupMembers.length > 0) {
          newGroups.push({
            id: uuidv4(),
            members: groupMembers,
          });
        }
      }
    }
    
    setGroups(newGroups);
  };

  const removeMember = (id: string) => {
    setMembers(members.filter(member => member.id !== id));
  };

  const resetAll = () => {
    setMembers([]);
    setGroups([]);
    setNewMember('');
    setGroupSize(2);
    setNumberOfGroups(2);
    setGroupingMethod('size');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-900 p-6">
      <div className="max-w-4xl mx-auto bg-gray-900/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-white">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
            Team Randomizer
          </h1>
          <button
            onClick={resetAll}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg border border-red-500/50 text-red-400 transition-all duration-300 hover:scale-105"
          >
            Reset All
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-fuchsia-500/30 transition-colors duration-300">
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
                placeholder="Enter player name"
                className="flex-1 px-4 py-2 bg-gray-900/50 border border-white/20 rounded-lg focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 outline-none text-white placeholder-gray-400"
              />
              <button
                onClick={handleAddMember}
                className="bg-fuchsia-600/50 hover:bg-fuchsia-600/70 text-white px-6 py-2 rounded-lg transition-all duration-300 font-semibold border border-fuchsia-500/50 hover:scale-105"
              >
                Add Player
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Import Players List
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-purple-500/50 file:text-sm file:font-semibold file:bg-purple-600/30 file:text-white hover:file:bg-purple-600/50 file:transition-colors"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Grouping Method
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setGroupingMethod('size')}
                  className={`px-4 py-2 rounded-lg border transition-all duration-300 ${
                    groupingMethod === 'size'
                      ? 'bg-purple-600/50 border-purple-500'
                      : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'
                  }`}
                >
                  Members per Team
                </button>
                <button
                  onClick={() => setGroupingMethod('count')}
                  className={`px-4 py-2 rounded-lg border transition-all duration-300 ${
                    groupingMethod === 'count'
                      ? 'bg-purple-600/50 border-purple-500'
                      : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'
                  }`}
                >
                  Number of Teams
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-32">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {groupingMethod === 'size' ? 'Team Size' : 'Number of Teams'}
                </label>
                <input
                  type="number"
                  value={groupingMethod === 'size' ? groupSize : numberOfGroups}
                  onChange={(e) => {
                    const value = Math.max(1, parseInt(e.target.value) || 1);
                    if (groupingMethod === 'size') {
                      setGroupSize(value);
                    } else {
                      setNumberOfGroups(value);
                    }
                  }}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none text-white"
                  min="1"
                  max={groupingMethod === 'size' ? members.length : Math.ceil(members.length / 2)}
                />
              </div>
              <button
                onClick={generateGroups}
                className="flex-1 bg-gradient-to-r from-blue-600/50 to-purple-600/50 hover:from-blue-600/70 hover:to-purple-600/70 text-white px-6 py-2 rounded-lg transition-all duration-300 font-semibold self-end border border-purple-500/50 shadow-lg"
              >
                Randomize Teams!
              </button>
            </div>

            {members.length > 0 && (
              <div className="mt-4 text-sm text-gray-400">
                {groupingMethod === 'size' ? (
                  <p>Will create approximately {Math.ceil(members.length / groupSize)} teams</p>
                ) : (
                  <p>Each team will have approximately {Math.ceil(members.length / numberOfGroups)} members</p>
                )}
              </div>
            )}
          </div>

          <div className="bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-fuchsia-500/30 transition-all duration-300">
            <button
              onClick={() => setIsPlayerListVisible(!isPlayerListVisible)}
              className="w-full p-4 flex justify-between items-center hover:bg-white/5"
            >
              <h2 className="text-xl font-bold text-fuchsia-300">
                Players ({members.length})
              </h2>
              <span className={`transform transition-transform duration-300 ${isPlayerListVisible ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            <div 
              className={`transition-all duration-300 ease-in-out ${
                isPlayerListVisible 
                  ? 'max-h-[500px] opacity-100 p-6' 
                  : 'max-h-0 opacity-0 overflow-hidden'
              }`}
            >
              <div className="flex flex-wrap gap-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="bg-gray-900/50 px-4 py-2 rounded-lg flex items-center gap-2 border border-white/10 hover:bg-gray-900/70 hover:scale-105 transition-all duration-300 animate-fadeIn"
                  >
                    <span className="text-gray-300">{member.name}</span>
                    <button
                      onClick={() => removeMember(member.id)}
                      className="text-red-400 hover:text-red-300 font-bold text-lg leading-none hover:rotate-90 transition-transform duration-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {groups.length > 0 && (
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-fuchsia-500/30 transition-colors duration-300 animate-fadeIn">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-fuchsia-300">Teams</h2>
                <button
                  onClick={generateGroups}
                  className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg border border-cyan-500/50 text-cyan-400 transition-all duration-300 hover:scale-105"
                >
                  Shuffle Again
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((group, index) => (
                  <div 
                    key={group.id} 
                    className="bg-gray-900/50 p-4 rounded-xl border border-white/10 hover:border-fuchsia-500/30 transition-all duration-300 hover:scale-105 animate-fadeIn"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <h3 className="font-bold text-lg bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent mb-3">
                      Team {index + 1}
                    </h3>
                    <ul className="space-y-2">
                      {group.members.map((member, memberIndex) => (
                        <li 
                          key={member.id} 
                          className="text-gray-300 animate-slideIn"
                          style={{ animationDelay: `${memberIndex * 100}ms` }}
                        >
                          {member.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupGenerator; 