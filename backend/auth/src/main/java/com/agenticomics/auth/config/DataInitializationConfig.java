package com.agenticomics.auth.config;

import com.agenticomics.auth.entity.Lab;
import com.agenticomics.auth.entity.Team;
import com.agenticomics.auth.entity.User;
import com.agenticomics.auth.entity.UserLabMembership;
import com.agenticomics.auth.entity.UserTeamMembership;
import com.agenticomics.auth.repository.LabRepository;
import com.agenticomics.auth.repository.TeamRepository;
import com.agenticomics.auth.repository.UserLabMembershipRepository;
import com.agenticomics.auth.repository.UserTeamMembershipRepository;
import com.agenticomics.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializationConfig implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private LabRepository labRepository;
    
    @Autowired
    private TeamRepository teamRepository;
    
    @Autowired
    private UserLabMembershipRepository userLabMembershipRepository;
    
    @Autowired
    private UserTeamMembershipRepository userTeamMembershipRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only create sample data if no users exist
        if (userRepository.count() == 0) {
            createSampleData();
        }
    }

    private void createSampleData() {
        // Create sample users
        User piJerry = createUser("pi_jerry", "pi123", "jerry.pi@agenticomics.com", "+1234567891", "Lab PI");
        User phdSarah = createUser("phd_sarah", "phd123", "sarah.phd@agenticomics.com", "+1987654322", "PhD Student");
        User masterMike = createUser("master_mike", "master123", "mike.master@agenticomics.com", "+1122334455", "Master Student");
        User analystLisa = createUser("analyst_lisa", "analyst123", "lisa.analyst@agenticomics.com", "+1555666777", "Data Analyst");
        User techTom = createUser("tech_tom", "tech123", "tom.tech@agenticomics.com", "+1888999000", "Technician");
        User profEmma = createUser("prof_emma", "prof123", "emma.prof@agenticomics.com", "+1444555666", "Professor");
        User postdocDavid = createUser("postdoc_david", "postdoc123", "david.postdoc@agenticomics.com", "+1777888999", "Postdoc");
        
        // Create sample labs
        Lab omicsLab = createLab("LAB001", "Omics Research Lab", "Advanced omics research laboratory", "University of Science", "Biology Department");
        Lab bioinfoLab = createLab("LAB002", "Bioinformatics Lab", "Computational biology and bioinformatics", "University of Science", "Computer Science Department");
        
        // Create sample teams
        Team omicsTeam1 = createTeam("TEAM001", "Omics Team Alpha", "Core omics research team", omicsLab, piJerry);
        Team omicsTeam2 = createTeam("TEAM002", "Omics Team Beta", "Secondary omics research team", omicsLab, profEmma);
        Team bioinfoTeam1 = createTeam("TEAM003", "Bioinfo Team Core", "Core bioinformatics team", bioinfoLab, profEmma);
        
        // Create lab memberships
        createLabMembership(piJerry, omicsLab, "Lab PI", "LAB001", null, true);
        createLabMembership(phdSarah, omicsLab, "PhD Student", "LAB002", piJerry, true);
        createLabMembership(masterMike, omicsLab, "Master Student", "LAB003", piJerry, true);
        createLabMembership(analystLisa, omicsLab, "Data Analyst", "LAB004", piJerry, true);
        createLabMembership(techTom, omicsLab, "Technician", "LAB005", piJerry, true);
        createLabMembership(profEmma, omicsLab, "Professor", "LAB006", null, false);
        createLabMembership(profEmma, bioinfoLab, "Professor", "BIO001", null, true);
        createLabMembership(postdocDavid, bioinfoLab, "Postdoc", "BIO002", profEmma, true);
        
        // Create team memberships
        createTeamMembership(piJerry, omicsTeam1, "Team Leader", "TM001", null, true);
        createTeamMembership(phdSarah, omicsTeam1, "Senior Member", "TM002", piJerry, true);
        createTeamMembership(masterMike, omicsTeam1, "Junior Member", "TM003", phdSarah, true);
        createTeamMembership(analystLisa, omicsTeam1, "Data Specialist", "TM004", piJerry, true);
        createTeamMembership(techTom, omicsTeam1, "Technical Support", "TM005", piJerry, true);
        
        createTeamMembership(profEmma, omicsTeam2, "Team Leader", "TM006", null, false);
        createTeamMembership(postdocDavid, omicsTeam2, "Senior Member", "TM007", profEmma, false);
        
        createTeamMembership(profEmma, bioinfoTeam1, "Team Leader", "TM008", null, true);
        createTeamMembership(postdocDavid, bioinfoTeam1, "Senior Member", "TM009", profEmma, true);
        
        System.out.println("✅ Sample data created successfully!");
        System.out.println("📊 Created:");
        System.out.println("   • 7 users (pi_jerry, phd_sarah, master_mike, analyst_lisa, tech_tom, prof_emma, postdoc_david)");
        System.out.println("   • 2 labs (Omics Research Lab, Bioinformatics Lab)");
        System.out.println("   • 3 teams (Omics Team Alpha, Omics Team Beta, Bioinfo Team Core)");
        System.out.println("   • Lab memberships with proper hierarchies");
        System.out.println("   • Team memberships with pi_jerry leading Omics Team Alpha");
        System.out.println("🔑 Login credentials:");
        System.out.println("   • pi_jerry/pi123 (Lab PI - leads Omics Team Alpha)");
        System.out.println("   • phd_sarah/phd123 (PhD Student - supervised by pi_jerry)");
        System.out.println("   • prof_emma/prof123 (Professor - leads Bioinfo Team Core)");
    }
    
    private User createUser(String username, String password, String email, String telephone, String role) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setTelephone(telephone);
        user.setRole(role);
        user.setIsActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    private Lab createLab(String labId, String labName, String labDescription, String institution, String department) {
        Lab lab = new Lab();
        lab.setLabId(labId);
        lab.setLabName(labName);
        lab.setLabDescription(labDescription);
        lab.setInstitution(institution);
        lab.setDepartment(department);
        lab.setIsActive(true);
        lab.setCreatedAt(LocalDateTime.now());
        lab.setUpdatedAt(LocalDateTime.now());
        return labRepository.save(lab);
    }
    
    private Team createTeam(String teamId, String teamName, String teamDescription, Lab lab, User teamLeader) {
        Team team = new Team();
        team.setTeamId(teamId);
        team.setTeamName(teamName);
        team.setTeamDescription(teamDescription);
        team.setLab(lab);
        team.setTeamLeader(teamLeader);
        team.setIsActive(true);
        team.setCreatedAt(LocalDateTime.now());
        team.setUpdatedAt(LocalDateTime.now());
        return teamRepository.save(team);
    }
    
    private void createLabMembership(User user, Lab lab, String roleInLab, String memberId, User supervisor, Boolean isPrimaryLab) {
        UserLabMembership membership = new UserLabMembership();
        membership.setUser(user);
        membership.setLab(lab);
        membership.setRoleInLab(roleInLab);
        membership.setMemberId(memberId);
        membership.setSupervisor(supervisor);
        membership.setIsPrimaryLab(isPrimaryLab);
        membership.setIsActive(true);
        membership.setJoinedAt(LocalDateTime.now());
        membership.setCreatedAt(LocalDateTime.now());
        membership.setUpdatedAt(LocalDateTime.now());
        userLabMembershipRepository.save(membership);
    }
    
    private void createTeamMembership(User user, Team team, String roleInTeam, String memberId, User supervisor, Boolean isPrimaryTeam) {
        UserTeamMembership membership = new UserTeamMembership();
        membership.setUser(user);
        membership.setTeam(team);
        membership.setRoleInTeam(roleInTeam);
        membership.setMemberId(memberId);
        membership.setSupervisor(supervisor);
        membership.setIsPrimaryTeam(isPrimaryTeam);
        membership.setIsActive(true);
        membership.setJoinedAt(LocalDateTime.now());
        membership.setCreatedAt(LocalDateTime.now());
        membership.setUpdatedAt(LocalDateTime.now());
        userTeamMembershipRepository.save(membership);
    }
} 