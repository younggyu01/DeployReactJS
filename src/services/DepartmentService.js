import axios from "axios";

// 환경 변수에서 API 기본 URL을 가져오거나 기본값(localhost:8080) 사용
const REST_API_BASE_URL = import.meta.env.VITE_APIURL || 'http://localhost:8080/api';
// 부서 관련 API의 기본 URL 구성
const DEPARTMENT_REST_API_URL = `${REST_API_BASE_URL}/departments`;

// 디버깅을 위한 URL 로그 출력
console.log(`REST_API_BASE_URL = ${REST_API_BASE_URL}`);
console.log(`DEPARTMENT_REST_API_URL = ${DEPARTMENT_REST_API_URL}`);

// Axios 인스턴스 생성 (공통 설정 적용)
const api = axios.create({
  baseURL: REST_API_BASE_URL,  // 모든 요청의 기본 URL
  timeout: 10000,              // 10초 타임아웃 설정
  headers: {
    'Content-Type': 'application/json',  // JSON 형식으로 통신
  },
});

/**
 * API 에러 처리 유틸리티 함수
 * @param {Error} error - 발생한 에러 객체
 * @param {string} operation - 수행 중이던 작업명 (에러 메시지에 사용)
 * @throws {Error} 상세한 에러 메시지를 가진 새로운 에러
 */
const handleApiError = (error, operation) => {
  console.error(`Error ${operation}:`, error);
  
  // 서버에서 응답을 받았지만 에러 상태 코드인 경우
  if (error.response) {
    const { status, data } = error.response;
    
    // HTTP 상태 코드에 따른 사용자 친화적인 에러 메시지
    switch (status) {
      case 400:
        throw new Error(data?.message || '잘못된 요청 데이터입니다.');
      case 401:
        throw new Error('인증이 필요합니다.');
      case 403:
        throw new Error('접근이 금지되었습니다.');
      case 404:
        throw new Error('부서를 찾을 수 없습니다.');
      case 409:
        throw new Error(data?.message || '부서 이름이 이미 존재합니다.');
      case 500:
        throw new Error('서버 내부 오류가 발생했습니다. 나중에 다시 시도해주세요.');
      default:
        throw new Error(data?.message || `서버 오류: ${status}`);
    }
  } 
  // 요청은 보냈지만 응답을 받지 못한 경우 (네트워크 문제 등)
  else if (error.request) {
    throw new Error('네트워크 연결 오류입니다. 인터넷 연결을 확인해주세요.');
  } 
  // 그 외 기타 에러
  else {
    throw new Error(error.message || '예기치 않은 오류가 발생했습니다.');
  }
};

/**
 * 부서 데이터 유효성 검사 함수
 * @param {Object} department - 검사할 부서 데이터
 * @throws {Error} 유효성 검사 실패 시 에러 메시지
 */
const validateDepartmentData = (department) => {
  // 부서명 필수 검사
  if (!department.departmentName || !department.departmentName.trim()) {
    throw new Error('부서명을 입력해주세요.');
  }
  
  // 부서명 최소 길이 검사 (2자 이상)
  if (department.departmentName.trim().length < 2) {
    throw new Error('부서명은 2자 이상이어야 합니다.');
  }
  
  // 부서명 최대 길이 검사 (100자 이하)
  if (department.departmentName.trim().length > 100) {
    throw new Error('부서명은 100자를 초과할 수 없습니다.');
  }
  
  // 부서 설명 최대 길이 검사 (500자 이하, 선택적 필드)
  if (department.departmentDescription && department.departmentDescription.length > 500) {
    throw new Error('부서 설명은 500자를 초과할 수 없습니다.');
  }
};

// ========== 부서 서비스 함수들 ==========

/**
 * 전체 부서 목록 조회
 * @returns {Promise} API 응답 객체
 */
export const getAllDepartments = async () => {
  try {
    console.log('부서 목록 조회 중...');
    const response = await api.get('/departments');
    console.log('부서 목록 조회 성공');
    return response;
  } catch (error) {
    handleApiError(error, '부서 목록 조회');
  }
};

/**
 * 새로운 부서 생성
 * @param {Object} department - 생성할 부서 데이터
 * @returns {Promise} API 응답 객체
 */
export const createDepartment = async (department) => {
  try {
    // 입력 데이터 유효성 검사
    validateDepartmentData(department);
    
    // 데이터 정리 (앞뒤 공백 제거)
    const cleanDepartment = {
      departmentName: department.departmentName.trim(),
      departmentDescription: department.departmentDescription?.trim() || ''  // 설명이 없으면 빈 문자열
    };
    
    console.log('부서 생성 중...');
    const response = await api.post('/departments', cleanDepartment);
    console.log('부서 생성 성공');
    return response;
  } catch (error) {
    handleApiError(error, '부서 생성');
  }
};

/**
 * 특정 부서 상세 정보 조회
 * @param {number|string} departmentId - 조회할 부서 ID
 * @returns {Promise} API 응답 객체
 */
export const getDepartmentById = async (departmentId) => {
  try {
    // ID 필수 검사
    if (!departmentId) {
      throw new Error('부서 ID가 필요합니다.');
    }
    
    console.log(`부서 ${departmentId} 정보 조회 중...`);
    const response = await api.get(`/departments/${departmentId}`);
    console.log('부서 정보 조회 성공');
    return response;
  } catch (error) {
    handleApiError(error, '부서 정보 조회');
  }
};

/**
 * 부서 정보 수정 (PATCH 요청 - 부분 수정)
 * @param {number|string} departmentId - 수정할 부서 ID
 * @param {Object} department - 수정할 부서 데이터
 * @returns {Promise} API 응답 객체
 */
export const updateDepartment = async (departmentId, department) => {
  try {
    // ID 필수 검사
    if (!departmentId) {
      throw new Error('부서 ID가 필요합니다.');
    }
    
    // 입력 데이터 유효성 검사
    validateDepartmentData(department);
    
    // 데이터 정리 (앞뒤 공백 제거)
    const cleanDepartment = {
      departmentName: department.departmentName.trim(),
      departmentDescription: department.departmentDescription?.trim() || ''
    };
    
    console.log(`부서 ${departmentId} 정보 수정 중...`);
    // PATCH 요청으로 부분 수정 (PUT 대신 PATCH 사용)
    const response = await api.patch(`/departments/${departmentId}`, cleanDepartment);
    console.log('부서 정보 수정 성공');
    return response;
  } catch (error) {
    handleApiError(error, '부서 정보 수정');
  }
};

/**
 * 부서 삭제
 * @param {number|string} departmentId - 삭제할 부서 ID
 * @returns {Promise} API 응답 객체
 */
export const deleteDepartment = async (departmentId) => {
  try {
    // ID 필수 검사
    if (!departmentId) {
      throw new Error('부서 ID가 필요합니다.');
    }
    
    console.log(`부서 ${departmentId} 삭제 중...`);
    const response = await api.delete(`/departments/${departmentId}`);
    console.log('부서 삭제 성공');
    return response;
  } catch (error) {
    handleApiError(error, '부서 삭제');
  }
};

// Axios 인스턴스 기본 export
export default api;